const { readdirSync } = require("fs");
const slash = require("../../../systems/setup/slash");

const choices = {};

module.exports = {
    name: "reload",
    description: "Reloads the given command.",
    permission: 3,
    execute: async (/** @type {require("discord.js").Client} */ client, /** @type {require("discord.js").CommandInteraction} */ interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const target = interaction.options.getString("command");
        if (!target) {
            await slash(client);
            interaction.editReply({ content: "All slash commands have been reloaded.", ephemeral: true });
            return;
        }
        const path = `../${target}.js`;
        const [command, subcommand] = target.split("/");

        delete require.cache[require.resolve(path)];
        if (subcommand !== undefined) {
            client.commands[command][subcommand] = require(path);
        } else {
            client.commands[command] = require(path);
        }

        interaction.editReply({ content: `\`${target.replace("/", " ")}\` has been reloaded` });
    },
    options: [
        {
            type: "String",
            name: "command",
            description: "The command to reload. Leave empty to reload all.",
            required: false,
            choices: choices,
        },
    ],
};

for (const command of readdirSync("./commands/slash/", { withFileTypes: true })) {
    if (command.isDirectory()) {
        for (const file of readdirSync(`./commands/slash/${command.name}/`)) {
            if (file.endsWith(".js")) {
                const name = `${command.name} ${require(`../${command.name}/${file}`).name}`;
                choices[name] = name.replace(" ", "/");
            }
        }
    } else if (command.name.endsWith(".js")) {
        const name = require(`../${command.name}`).name;
        choices[name] = name;
    }
}
