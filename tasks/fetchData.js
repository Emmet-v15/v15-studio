require("dotenv").config();
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { username, password, timetableURL } = require("../config.json");
const http = require("http");
var data = {};

async function fetchTimetable() {
    const browser = await puppeteer.launch({
        devtools: false,
        userDataDir: "./cache",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    // saveThumbnail(browser);
    const page = await browser.newPage();
    await page.authenticate({ username: username, password: password });

    await page.goto(timetableURL, { waitUntil: "networkidle2" }).catch((e) => void 0);

    const cells = await page.evaluate(() => {
        const rows = document.querySelectorAll("#Content_Content_Content_MainContent_timetable1_tbltimetable tr");
        return Array.from(rows, (row) => {
            const columns = row.querySelectorAll("td");
            return Array.from(columns, (column) => column.innerText);
        });
    });
    if (cells.length == 0) {
        console.log("Failed to fetch, Retrying...");
        fetchTimetable();
        return;
    }
    page.close();
    data = {
        timestamp: Date.now() + 60 * 60 * 1000,
        cells: cells.slice(0),
    };
    fs.writeFileSync(
        path.join(__dirname, "../public/timetable/timetableData.json"),
        JSON.stringify({ data: data }, null, 4)
    );

    setTimeout(() => {
        saveThumbnail(browser);
    }, 1 * 1000);

    setTimeout(fetchTimetable, 60 * 60 * 1000);
}

async function saveThumbnail(browser) {
    http.get("http://example.com/category", async (res) => {
        const page = await browser.newPage();
        await page.goto("https://v15.studio/timetable", { waitUntil: "networkidle2" }).catch((e) => void 0);
        await page.setViewport({ width: 700, height: 400, deviceScaleFactor: 2 });
        await page.screenshot({
            path: path.join(__dirname, "../public/timetable/thumbnail.png"),
            fullPage: true,
        });
        await browser.close();
    }).on("error", function (e) {
        console.log("Failed to create new Thumbnail.");
    });
}

fetchTimetable();
