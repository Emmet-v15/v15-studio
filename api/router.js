const { Router } = require("express");
const router = Router();

router.get("*", function (req, res, next) {
    if (!req.url.startsWith("/api/v1")) req.url = "/api/v1" + req.url;
    next();
});

router.get("/", function (req, res) {
    res.send("Welcome to our API!");
});

router.get("/users", function (req, res) {
    res.json([{ name: "Emmet" }]);
});

module.exports = router;