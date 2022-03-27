var express = require("express");
var router = express.Router();
var fs = require("fs");

router.get("/", (req, res, next) => {
    res.render("index", (err, html) => {
        if (err) {
            console.log(err);
            return;
        }
        res.send(html);
    });
});

module.exports = router;
