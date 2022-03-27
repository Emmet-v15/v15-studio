const { Router } = require("express");
const router = Router();

router.get("*", function (req, res, next) {
    console.log(req.ip);
    if (!req.url.startsWith("/api/v1")) console.log("bad");
});

router.get("/api/v1", function (req, res) {
    res.send("Welcome to our API!");
});

router.get("/api/v1/users", function (req, res) {
    res.json([{ name: "Emmet" }]);
});

module.exports = router;
