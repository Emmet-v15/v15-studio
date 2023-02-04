const https = require("https");
const fs = require("fs");
const subdomain = require("express-subdomain");
const express = require("express");
const logger = require("./systems/logging/logger");
const app = express();
const path = require("path");
const port = 443;

// Server

logger.log("Server Starting...", "log");

const options = {
    key: fs.readFileSync("sslcert/v15.studio.key"),
    cert: fs.readFileSync("sslcert/v15.studio.pem"),
    ca: fs.readFileSync("sslcert/origin-ca.pem"),
};

app.use(express.static(path.join(__dirname, "public")));
app.use(subdomain("api", require("./api/router")));

https
    .createServer(options, (req, res) => {
        const a = req.socket.remoteAddress.slice(7);
        logger.log(`{${a.startsWith("172.70") ? "localhost" : a}}: [${req.method} ${req.url}]`);
        app.handle(req, res);
    })
    .listen(port, (err) => {
        if (err) console.error(err);
        logger.ready(`Server started on port ${port}`);
    });

// tasks

require("./tasks/fetchData");

// process

if (process.platform === "win32") {
    var rl = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.on("SIGINT", function () {
        process.emit("SIGINT");
    });
}

process.on("SIGINT", function () {
    logger.log("Shutting Down...", "log");
    process.exit();
});

const { client } = require("./bot");

console.log(client());
