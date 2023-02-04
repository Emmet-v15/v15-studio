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

async function saveThumbnail(browser, page) {
    http.get("http://v15.studio/timetable", async (res) => {
        console.log("Fetching https://v15.studio/timetable...");
        await page.goto("https://v15.studio/timetable", { waitUntil: "networkidle2" }).catch((e) => {
            logger.error("Error while fetching timetable: " + e);
        });
        console.log("Fetched https://v15.studio/timetable");
        await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 1 });

        console.log("Saving screenshot...");
        await page
            .screenshot({
                path: `${__dirname}/../../public/timetable/thumbnail-temp.png`,
                fullPage: true,
            })
            .catch((e) => void 0);

        console.log("Saved screenshot");
        await browser.close();

        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 6; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

        const filename = `thumbnail_${text}.png`;
        var m = JSON.parse(fs.readFileSync(dataJson).toString());
        m["thumbnail"] = `https://v15.studio/timetable/${filename}`;
        fs.writeFileSync(dataJson, JSON.stringify(m, null, 4));

        let inputHtml = fs.readFileSync(`${__dirname}/../../public/timetable/index.html`).toString();
        let $ = require("cheerio").load(inputHtml);
        $("meta[property='og:image']").attr("content", `https://v15.studio/timetable/${filename}`);
        $("meta[property='twitter:image']").attr("content", `https://v15.studio/timetable/${filename}`);
        $("meta[property='twitter:image:src']").attr("content", `https://v15.studio/timetable/${filename}`);

        fs.writeFileSync(`${__dirname}/../../public/timetable/index.html`, $.html());

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
        logger.error("Failed to save timetable thumbnail");
    });
    await browser.close();
}

module.exports = async (client) => {
    instantInterval(async () => {
        const browser = await puppeteer.launch({
            devtools: false,
            userDataDir: "./cache",
            args: [
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--no-first-run",
                "--no-zygote",
                "--single-process",
                "--disable-gpu",
                "--disable-background-networking",
                "--disable-default-apps",
                "--disable-extensions",
                "--disable-sync",
                "--disable-translate",
                "--hide-scrollbars",
                "--metrics-recording-only",
                "--mute-audio",
                "--no-default-browser-check",
                "--no-pings",
                "--no-sandbox",
            ],
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

        await page.close();
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

        setTimeout(() => {
            saveThumbnail(browser, page);
        }, 10 * 1000);
    }, 60 * 60 * 1000);
};
