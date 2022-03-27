const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { username, password, timetableURL } = require("./config.json");
var data = {};

async function fetchData() {
    let browser = await puppeteer.launch({
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

    setTimeout(() => {
        browser.close();
    }, 60 * 1000);

    if (cells.length == 0) {
        console.log("Failed to fetch, Retrying...");
        fetchData();
        return;
    }
    data = {
        timestamp: Date.now() + 60 * 60 * 1000,
        cells: cells.slice(0),
    };
    fs.writeFileSync(path.join(__dirname, "public/timetable/data.json"), JSON.stringify({ data: data }, null, 4));
    console.log(`Fetched Data at ${new Date().getHours()}:${new Date().getMinutes()}`);
    setTimeout(fetchData, 60 * 60 * 1000);
}

fetchData();
