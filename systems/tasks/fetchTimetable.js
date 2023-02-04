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
        logger.debug("Fetching https://v15.studio/timetable...");
        await page.goto("https://v15.studio/timetable", { waitUntil: "networkidle2" });
        await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 1 });
        await page.screenshot({
            path: `${__dirname}/../../public/timetable/thumbnail-temp.png`,
            fullPage: true,
        });
        await browser.close();

        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 6; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
        const filename = `thumbnail_${text}.png`;

        // update html meta tags for new thumbnail

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

        await sharp(`${__dirname}/../../public/timetable/thumbnail-temp.png`)
            .extract({ width: 960, height: 480, left: 120, top: 120 })
            .toFile(`${thumbnail_path}${filename}`);
        logger.log("Saved timetable thumbnail");
    }).on("error", async (e) => {
        logger.error("Failed to save timetable thumbnail");
        await page.close();
        await browser.close();
    });
}

const fetchTimetable = async () => {
    const browser = await puppeteer.launch({
        devtools: false,
        headless: true,
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

    let cells;
    try {
        cells = await page.evaluate(() => {
            const rows = document.querySelectorAll("#Content_Content_Content_MainContent_timetable1_tbltimetable tr");
            return Array.from(rows, (row) => {
                const columns = row.querySelectorAll("td");
                return Array.from(columns, (column) => column.innerText);
            });
        });
    } catch (e) {
        setTimeout(() => {
            fetchTimetable();
        }, 10000);
        logger.warn("Failed to fetch, retrying in 10 seconds");
        return await browser.close();
    }

    if (cells.length == 0) {
        setTimeout(() => {
            fetchTimetable();
        }, 10000);
        logger.warn("Failed to fetch, retrying in 10 seconds");
        return await browser.close();
    }

    data = {
        timestamp: Date.now() + 60 * 60 * 1000,
        cells: cells.slice(0),
    };

    fs.writeFileSync(dataJson, JSON.stringify({ data: data }, null, 4));
    logger.debug("Fetched timetable data");

    setTimeout(() => {
        saveThumbnail(browser, page);
    }, 1 * 1000);
};

module.exports = async (client) => {
    instantInterval(fetchTimetable, 60 * 60 * 1000);
};
