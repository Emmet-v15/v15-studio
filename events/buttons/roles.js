module.exports = async (/** @type {import("discord.js").Client} */ client, /** @type {import("discord.js").ButtonInteraction} */ interaction, ...args) => {
    const role = interaction.guild.roles.cache.find((r) => r.id == [args][0]);
    if (interaction.member.roles.cache.find((r) => r.id == role.id)) {
        // check if permission is higher than the bot
        let bot = await interaction.guild.members.fetch(client.user.id);
        if (bot.roles.highest.rawPosition <= role.rawPosition) {
            return interaction.editReply({
                content: "You cannot add/remove a role that is higher than the bot's role",
            });
        }
        await interaction.member.roles.remove(role);
        interaction.editReply({ content: `<@&${role.id}> has been removed` });
    } else {
        await interaction.member.roles.add(role);
        interaction.editReply({ content: `<@&${role.id}> has been added` });
    }
};
