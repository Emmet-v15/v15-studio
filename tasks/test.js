const puppeteer = require("puppeteer");
const { username, password, timetableURL } = require("../config.json");

const doTask = async (i) => {
    const browser = await puppeteer.launch({
        devtools: false,
        userDataDir: "./cache",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    page.authenticate({ username: username, password: password });
    page.goto(timetableURL, { waitUntil: "networkidle2" }).catch((e) => void 0);
    await browser.close();

    const cells = await page.evaluate(() => {
        const rows = document.querySelectorAll("#Content_Content_Content_MainContent_timetable1_tbltimetable tr");
        return Array.from(rows, (row) => {
            const columns = row.querySelectorAll("td");
            return Array.from(columns, (column) => column.innerText);
        });
    });

    if (cells.length == 0) {
        return console.log("Failed to fetch", i);
    }
    console.log("Fetched timetable data", i);
};

for (let i = 0; i < 1000; i++) {
    console.log("starting", i);
    doTask(i);
}
