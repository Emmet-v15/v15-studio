require("dotenv").config();
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { username, password, timetableURL } = require("../config.json");
const http = require("http");
const sharp = require("sharp");
const dataJson = path.join(__dirname, "../public/timetable/timetableData.json");
var data = {};

async function fetchTimetable() {
    const browser = await puppeteer.launch({
        devtools: false,
        userDataDir: "./cache",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
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
        await browser.close();
        setTimeout(() => {
            fetchTimetable();
        }, 10000);
        return;
    }
    page.close();
    data = {
        timestamp: Date.now() + 60 * 60 * 1000,
        cells: cells.slice(0),
    };
    fs.writeFileSync(dataJson, JSON.stringify({ data: data }, null, 4));

    setTimeout(() => {
        saveThumbnail(browser);
    }, 1 * 1000);

    setTimeout(fetchTimetable, 60 * 60 * 1000);
}
// generate 6 random numbers and letters between 0 and 9
function generateRandomString() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 6; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

async function saveThumbnail(browser) {
    http.get("http://v15.studio/timetable", async (res) => {
        const page = await browser.newPage();
        await page.goto("https://v15.studio/timetable", { waitUntil: "networkidle2" }).catch((e) => void 0);
        await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 1 });
        await page
            .screenshot({
                path: `${__dirname}/thumbnail-temp.png`,
                fullPage: true,
            })
            .catch((e) => void 0);
        await browser.close();
        const filename = `thumbnail_${generateRandomString()}.png`;
        var m = JSON.parse(fs.readFileSync(dataJson).toString());
        m["thumbnail"] = `https://v15.studio/timetable/${filename}`;
        fs.writeFileSync(dataJson, JSON.stringify(m, null, 4));

        const thumbnail_path = `${__dirname}/../public/timetable/`;
        let regex = /thumbnail_.*\.png$/;
        fs.readdirSync(thumbnail_path)
            .filter((f) => regex.test(f))
            .map((f) => fs.unlinkSync(thumbnail_path + f));

        sharp(`${__dirname}/thumbnail-temp.png`)
            .extract({ width: 960, height: 480, left: 120, top: 120 })
            .toFile(`${thumbnail_path}${filename}`)
            .then(() => {
                console.log("Image cropped and saved");
            })
            .catch((e) => {
                console.log(e);
            });
    }).on("error", (e) => {
        browser.close();
        console.log("Failed to create new Thumbnail.");
    });
}

fetchTimetable();
