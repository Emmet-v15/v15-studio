require("dotenv").config();
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const http = require("http");
const sharp = require("sharp");

const logger = require("../logging/logger");
const { instantInterval } = require("../../util/interval");
const dataJson = path.join(__dirname, "../../public/timetable/timetableData.json");
var data = {};

async function saveThumbnail() {
    http.get("http://v15.studio/timetable", async (res) => {
        const browser = await puppeteer.launch({
            devtools: false,
            userDataDir: "./cache",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();
        await page.goto("https://v15.studio/timetable", { waitUntil: "networkidle2" }).catch((e) => void 0);
        await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 1 });
        await page
            .screenshot({
                path: `${__dirname}/../../public/timetable/thumbnail-temp.png`,
                fullPage: true,
            })
            .catch((e) => void 0);
        await browser.close();

        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 6; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

        const filename = `thumbnail_${text}.png`;
        var m = JSON.parse(fs.readFileSync(dataJson).toString());
        m["thumbnail"] = `https://v15.studio/timetable/${filename}`;
        fs.writeFileSync(dataJson, JSON.stringify(m, null, 4));

        const thumbnail_path = `${__dirname}/../../public/timetable/`;
        let regex = /thumbnail_.*\.png$/;
        fs.readdirSync(thumbnail_path)
            .filter((f) => regex.test(f))
            .map((f) => fs.unlinkSync(thumbnail_path + f));

        sharp(`${__dirname}/../../public/timetable/thumbnail-temp.png`)
            .extract({ width: 960, height: 480, left: 120, top: 120 })
            .toFile(`${thumbnail_path}${filename}`)
            .then(() => {
                logger.debug("Saved thumbnail");
            })
            .catch((e) => {
                logger.error(e);
                throw e;
            });
    }).on("error", async (e) => {
        // await browser.close();
        logger.error("Failed to save timetable thumbnail");
    });
}

module.exports = async (client) => {
    instantInterval(async () => {
        const browser = await puppeteer.launch({
            devtools: false,
            userDataDir: "./cache",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();
        await page.authenticate({ username: process.env.TT_USERNAME, password: process.env.TT_PASSWORD });
        await page.goto(process.env.TT_URL, { waitUntil: "networkidle2" }).catch((e) => void 0);

        const cells = await page.evaluate(() => {
            const rows = document.querySelectorAll("#Content_Content_Content_MainContent_timetable1_tbltimetable tr");
            return Array.from(rows, (row) => {
                const columns = row.querySelectorAll("td");
                return Array.from(columns, (column) => column.innerText);
            });
        });
        await browser.close();

        if (cells.length == 0) {
            setTimeout(() => {
                fetchTimetable();
            }, 10000);
            logger.warn("Failed to fetch, retrying in 10 seconds");
            return;
        }

        data = {
            timestamp: Date.now() + 60 * 60 * 1000,
            cells: cells.slice(0),
        };

        fs.writeFileSync(dataJson, JSON.stringify({ data: data }, null, 4));
        logger.debug("Fetched timetable data");

        saveThumbnail();
    }, 60 * 60 * 1000);
};
