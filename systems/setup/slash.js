require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");
const { readdirSync } = require("fs");

const register = require("./register");

const logger = require("../logging/logger");
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
module.exports = async (client) => {
    const commands = [];
    const store = {};

    for (var i in require.cache) {
        delete require.cache[i];
    }

    for (const command of readdirSync("./commands/slash", { withFileTypes: true })) {
        if (command.isDirectory()) {
            const cmd = new SlashCommandBuilder().setName(command.name).setDescription(command.name);
            store[command.name] = {};

            for (const file of readdirSync(`./commands/slash/${command.name}/`)) {
                if (file.endsWith(".js")) {
                    const task = logger.load(`Loading Slash Command: ${command.name}/${file}.`);
                    const path = `../../commands/slash/${command.name}/${file}`;
                    const module = require(path);
                    store[command.name][module.name] = module;
                    cmd.addSubcommand((subcommand) => register(subcommand, module));
                    task.complete();
                }
            }
            commands.push(cmd.toJSON());
        } else if (command.name.endsWith(".js")) {
            const task = logger.load(`Loading Slash Command: ${command.name}.`);
            const path = `../../commands/slash/${command.name}`;
            const module = require(path);
            store[module.name] = module;
            commands.push(register(new SlashCommandBuilder(), module).toJSON());
            task.complete();
        }
    }

    client.commands = store;
    await rest.put(Routes.applicationCommands(client.user.id), {
        body: commands,
    });
};
