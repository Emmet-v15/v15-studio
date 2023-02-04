const logger = require("../../../systems/logging/logger");

module.exports = {
    name: "shutdown",
    description: "Shuts down the bot.",
    permission: 3,
    execute: async (/** @type {require("discord.js").Client} */ client, /** @type {require("discord.js").CommandInteraction} */ interaction) => {
        await interaction.reply({ content: "Shutting Down..." });
        logger.info("Shutting Down... [Command]");
        client.destroy();
        process.exit();
    },
};
