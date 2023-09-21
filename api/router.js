const { Router } = require("express");
const router = Router();

router.get("*", function (req, res, next) {
    if (!req.url.startsWith("/api/v1")) res.redirect("/api/v1" + req.url);
    next();
});

router.get("/v1", function (req, res) {
    res.send("Emmet's API");
});

router.post("/v1/pollbot/", function (req, res) {
    console.log(req);
    const body = req.body;
    console.log(body)

    if (!body) return res.send("no body");
    if (body.method == "upvote") {
        console.log("Method: Up Vote");
        console.log("Post^: " + body.post);
    }
    res.sendStatus(200);
});

module.exports = router;
