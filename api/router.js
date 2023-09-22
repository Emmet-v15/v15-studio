const { Router } = require("express");
const router = Router();

router.get("*", function (req, res, next) {
    if (!req.url.startsWith("/api/v1")) res.redirect("/api/v1" + req.url);
    next();
});

router.get("/v1", function (req, res) {
    res.send("Emmet's API");
});

let url = "https://pollev.com/oscpp"

router.post("/v1/pollbot/", function (req, res) {
    const body = req.body;

    if (!body) return res.send("no body");
    if (body.url) url = `https://pollev.com/${body.url}`;
    if (body.post) post = body.post;
    res.sendStatus(200);
});

router.get("/v1/pollbotget/", function (req, res) {
    // res.sendStatus(200);
    res.send(JSON.stringify({ url, post }));
});

module.exports = router;
