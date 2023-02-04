const { readdirSync } = require("fs");

// const { getpermissionlevel } = require("../systems/setup/permissions");
const logger = require("../systems/logging/logger");
// Buttons //

const buttons = {};
const modals = {};

(async () => {
    for (const file of readdirSync("./events/buttons/")) {
        if (file.endsWith(".js")) {
            const task = logger.load(`Loading Buttons: ${file}.`);
            buttons[file.substring(0, file.length - 3)] = require(`./buttons/${file}`);
            task.complete();
        }
    }
})();

for (const file of readdirSync("./events/modals/")) {
    if (file.endsWith(".js")) {
        const task = logger.load(`Loading Modals: ${file}.`);
        modals[file.substring(0, file.length - 3)] = require(`./modals/${file}`);
        task.complete();
    }
}

// Main //

module.exports = async (/** @type {import("discord.js").Client}*/ client, /** @type {import("discord.js").Interaction} */ interaction) => {
    if (interaction.isChatInputCommand()) {
        const subcommand = interaction.options.getSubcommand(false);
        const command = subcommand !== null ? client.commands[interaction.commandName][subcommand] : client.commands[interaction.commandName];
        if (command.permission) {
            // let permission = getpermissionlevel(interaction.user, interaction.guild);
            // if (permission < command.permission && interaction.user.id !== "715601051041923123") {
            if (interaction.user.id !== "715601051041923123") {
                // interaction.reply({
                //     content: `You cannot use \`${
                //         subcommand !== null ? `${interaction.commandName} ${subcommand}` : interaction.commandName
                //     }\`. Your permission level is \`[${permission}]\`, \`[${command.permission}]\` or above is required.`,
                // });
                interaction.reply("You cannot use this command.");
                return;
            }
        }
        logger.cmd(`${interaction.user.tag} used ${interaction.commandName} in ${interaction.guild.name}`);
        let res = await command.execute(client, interaction);
    } else if (interaction.isButton()) {
        const args = interaction.customId.split("-");
        await buttons[args.shift()](client, interaction, ...args);
    } else if (interaction.isModalSubmit()) {
        const args = interaction.customId.split("-");
        await modals[args.shift()](client, interaction, ...args);
    }
};
