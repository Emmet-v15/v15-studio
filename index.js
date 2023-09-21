const https = require("https");
const fs = require("fs");
const { readdirSync } = require("fs");
const subdomain = require("express-subdomain");
const express = require("express");
const logger = require("./systems/logging/logger");
const client = require("./bot");
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

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(subdomain("api", require("./api/router")));

https
    .createServer(options, (req, res) => {
        const a = req.socket.remoteAddress.slice(7);
        let ip;
        if (a.startsWith("172.70")) {
            ip = "localhost";
        } else {
            ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        }
        logger.log(`{${ip}}: [${req.method} ${req.url}]`);
        app.handle(req, res);
    })
    .listen(port, (err) => {
        if (err) console.error(err);
        logger.ready(`Server started on port ${port}`);
    });

// tasks

process.on("unhandledRejection", (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}\nreason: ${reason}`);
});
process.on("uncaughtException", (err) => {
    logger.error(`Uncaught Exception: ${err}`);
});


for (const task of readdirSync("./systems/tasks", { withFileTypes: true })) {
    if (task.isDirectory()) {
        for (const file of readdirSync(`./systems/tasks/${task.name}/`, { withFileTypes: true })) {
            if (task.name.endsWith(".js")) {
                console.log(task);
                const task_ = logger.log(`Loading Task: ${task.name}/${file}.`);
                const path = `./systems/tasks/${task.name}/${file}`;
                const module = require(path);
                module(client);
                task_.complete();
            }
        }
    } else if (task.name.endsWith(".js")) {
        const task_ = logger.load(`Loading Task: ${task.name}.`);
        const path = `./systems/tasks/${task.name}`;
        const module = require(path);
        module(client);
        task_.complete();
    }
}

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
    client.guildDB.close();
    client.userDB.close();
    client.globalDB.close();
    process.exit();
});
