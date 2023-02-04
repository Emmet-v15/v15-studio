const slash = require("../systems/setup/slash");
const logger = require("../systems/logging/logger");

module.exports = async (client) => {
    // client.guilds.cache.forEach((guild) => {
    //     client.settings.ensure(guild.id, require("../systems/settings/template.json"));
    // });

    await slash(client);
    logger.log(`${client.user.tag}, serving ${client.users.cache.size} users in ${client.guilds.cache.size} servers`, "ready");

    process.on("uncaughtException", exception.bind(null, client));

    process.on("unhandledRejection", exception.bind(null, client));
};
