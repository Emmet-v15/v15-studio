const { Router } = require("express");
const router = Router();

router.get("*", function (req, res, next) {
    console.log(req.subdomains);
    if (!req.url.startsWith("/api/v1")) res.redirect("/api/v1" + req.url);
    next();
});

router.get("/api/v1", function (req, res) {
    res.send("Emmet's API");
});

module.exports = router;
