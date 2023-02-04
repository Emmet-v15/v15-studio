const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "reminders",
    description: "Lists all active reminders.",
    permission: 3,
    execute: async (/** @type {require("discord.js").Client} */ client, /** @type {require("discord.js").CommandInteraction} */ interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const reminders = client.globalDB.get("reminders") || {};
        if (Object.keys(reminders).length === 0) return interaction.editReply({ content: "No reminders found." });

        let embed = new EmbedBuilder().setTitle("Reminders").setColor(client.color);

        let fields = [];
        for (let key of Object.keys(reminders)) {
            const reminder = reminders[key];
            fields.push({
                name: key,
                value: `**User:** <@${reminder.user}>\n**Time:** <t:${Math.round(reminder.time / 1000)}:R>\n**Message:** ${reminder.message}`,
                inline: false,
            });
        }
        embed.addFields(fields);

        interaction.editReply({ embeds: [embed] });
    },
};
