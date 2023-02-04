require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { readdirSync } = require("fs");
const enmap = require("enmap");

const logger = require("./systems/logging/logger");
const exception = require("./systems/logging/exception");

logger.log("Bot Starting...", "log");

const client = new Client({
    intents: [32767, GatewayIntentBits.MessageContent],
    partials: ["CHANNEL"],
});

client.settings = new enmap({
    name: "settings",
    fetchAll: false,
    autoFetch: true,
    cloneLevel: "deep",
    dataDir: "./systems/database",
});

// Process

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

process.on("uncaughtException", exception.bind(null, client));

process.on("unhandledRejection", exception.bind(null, client));
// Events and Tasks

for (const event of readdirSync("./events/")) {
    if (event.endsWith(".js")) {
        const task = logger.load(`Loading Event: ${event}.`);
        client.on(event.substring(0, event.length - 3), require(`./events/${event}`).bind(null, client));
        task.complete();
    }
}

client.login();

module.exports = {
    client: () => {
        return client;
    },
};
