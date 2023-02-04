const puppeteer = require("puppeteer");

(async () => {
    const browser = await puppeteer.launch({
        devtools: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto("https://www.github.com");
})();
