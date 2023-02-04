const { ButtonBuilder, ActionRowBuilder, EmbedBuilder, ChannelType, ButtonStyle } = require("discord.js");

module.exports = async (/** @type {import("discord.js").Client} */ client, /** @type {import("discord.js").ModalSubmitInteraction} */ interaction, ...args) => {
    await interaction.deferReply({ ephemeral: true });

    switch (args[0]) {
        case "create": {
            const reason = interaction.fields.getTextInputValue("reason");
            const executor = interaction.fields.getTextInputValue("executor");

            /** @type {import("discord.js").ThreadChannel} */
            const thread = await interaction.channel.threads.create({
                name: `${interaction.user.username.slice(0, 9).toLowerCase()}-${interaction.user.discriminator}`,
                autoArchiveDuration: 24 * 60,
                type: ChannelType.PrivateThread,
                reason: "Ticket created by user",
            });

            const ticketEmbed = new EmbedBuilder()
                .setTitle(`Ticket for ${interaction.user.username}#${interaction.user.discriminator}`)
                .setThumbnail(interaction.user.avatarURL())
                .setDescription(`<@${interaction.user.id}> This is your ticket, our support team with be with you shortly to help you resolve your issue.`)
                .addFields([
                    {
                        name: "Account Age",
                        value: `Made <t:${parseInt(interaction.user.createdTimestamp.toString().slice(0, -3))}:R>`,
                        inline: true,
                    },
                    {
                        name: "Join Date",
                        value: `Joined <t:${parseInt(interaction.member.joinedTimestamp.toString().slice(0, -3))}:R>`,
                        inline: true,
                    },
                    {
                        name: "Premium Status",
                        value: `Expires <date:in X days/months>`,
                        inline: true,
                    },
                    { name: "Executor", value: executor, inline: true },

                    {
                        name: "HWID",
                        value: "Hwid?",
                        inline: true,
                    },
                    { name: "Reason", value: `**${reason}**`, inline: true },
                ])
                .setColor(interaction.member.displayHexColor)
                .setFooter({
                    text: "EvoTickets [BETA] | Project Evo V4 | Press the button below to close the ticket",
                    iconURL: client.user.avatarURL(),
                });

            const ticketButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("tickets-close").setLabel("Mark as completed").setEmoji("📨").setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId("tickets-claim").setLabel("Claim this ticket").setEmoji("📨").setStyle(ButtonStyle.Success)
            );

            await thread.send({
                embeds: [ticketEmbed],
                components: [ticketButtons],
            });

            const userEmbed = new EmbedBuilder()
                .setTitle("Ticket created")
                .setDescription(`Your ticket has been created! You can view it here: <#${thread.id}>`)
                .setColor("#00ff00")
                .setTimestamp();

            thread.members.add(interaction.user.id);
            return interaction.editReply({ embeds: [userEmbed] });
        }
        default:
            interaction.editReply({ content: "[Error]: Modal not implemented." });
            break;
    }

    interaction.reply({
        content: `There was an error: tickets.js`,
        ephemeral: true,
    });
};
