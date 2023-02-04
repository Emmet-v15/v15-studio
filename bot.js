require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { readdirSync } = require("fs");
const enmap = require("enmap");

const logger = require("./systems/logging/logger");

logger.log("Bot Starting...", "log");

const client = new Client({
    intents: [32767, GatewayIntentBits.MessageContent],
    partials: ["CHANNEL"],
});

client.color = "AAC2C6";

client.globalDB = new enmap({
    name: "global",
    fetchAll: false,
    autoFetch: true,
    cloneLevel: "deep",
    dataDir: "./systems/settings/data",
});
client.guildDB = new enmap({
    name: "guilds",
    fetchAll: false,
    autoFetch: true,
    cloneLevel: "deep",
    dataDir: "./systems/settings/data",
});
client.userDB = new enmap({
    name: "users",
    fetchAll: false,
    autoFetch: true,
    cloneLevel: "deep",
    dataDir: "./systems/settings/data",
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

// Events and Tasks

for (const event of readdirSync("./events/")) {
    if (event.endsWith(".js")) {
        const task = logger.load(`Loading Event: ${event}.`);
        client.on(event.substring(0, event.length - 3), require(`./events/${event}`).bind(null, client));
        task.complete();
    }
}

client.login();

module.exports = client;
