const { EmbedBuilder, codeBlock } = require("discord.js");
const { CombinedError, CombinedPropertyError } = require("@sapphire/shapeshift");
const path = require("path");
const logger = require("./logger");

const removeUnwantedTraces = (input) => {
    if (!input) return input;
    const array = input.replaceAll(path.resolve("./"), ".").split("\n");
    var stack = "";
    for (var i = 0; i < array.length; i++) {
        const line = array[i];
        if (!line.includes("node_modules")) {
            stack += `${line.trim()}\n`;
        }
    }
    return stack;
};

const handleError = (client, err) => {
    if (err instanceof CombinedError || err instanceof CombinedPropertyError) {
        err.errors.forEach((e) => handleError(client, e));
        return;
    }

    if (Array.isArray(err)) {
        console.error(err);
        return;
    }

    const stack = removeUnwantedTraces(err.stack)?.replace(`Error: ${err.message}\n`, "");

    const msg = removeUnwantedTraces(err.message) || "No message";
    client.guilds.cache.forEach((guild) => {
        const channel = client.channels.cache.find((c) => c.id === client.globalDB.get("debug.channel"));
        if (channel) {
            channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Unhandled Error")
                        .addFields([
                            {
                                name: "Type:",
                                value: err.constructor.name || "No type",
                                inline: true,
                            },
                            {
                                name: "Message:",
                                value: msg,
                                inline: true,
                            },
                            {
                                name: "Stack:",
                                value: stack ? codeBlock("sql", stack) : "No stack",
                            },
                        ])
                        .setColor("#ff0000")
                        .setTimestamp(),
                ],
            });
        }
    });
};

module.exports = (client, err) => {
    if (err instanceof CombinedError || err instanceof CombinedPropertyError) {
        for (var i = 0; i < err.errors.length; i++) {
            logger.error(err.errors[i]);
            handleError(client, err.errors[i]);
        }
    } else {
        handleError(client, err);
    }
};
