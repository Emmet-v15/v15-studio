const { Router } = require("express");
const router = Router();

router.get("*", function (req, res, next) {
    if (!req.url.startsWith("/api/v1")) res.redirect("/api/v1" + req.url);
    next();
});

router.get("/api/v1", function (req, res) {
    res.send("Emmet's API");
});

router.post("/api/v1/pollbot", function (req, res) {
    const body = req.body;
    if (!body) return;
    if (body.method == "upvote") {
        console.log("Method: Up Vote");
        console.log("Post^: " + body.post);
    }
});

module.exports = router;
