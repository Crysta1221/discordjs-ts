// src/commands/info/about.ts
import type { CommandInteraction, Client } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { client } from "../../";
const aboutCommand = {
  name: "about",
  description: "Botの情報を表示します",
  async execute(interaction: CommandInteraction) {
    if (!client.user) return;
    const startTime = Date.now() - client.uptime!;
    const startTimestamp = Math.floor(startTime / 1000);

    const aboutEmbed = new EmbedBuilder()
      .setColor("#0071BF")
      .setTitle(`${client.user.username} の情報`)
      .setDescription(`${client.user.username}の情報`)
      .addFields(
        { name: "WebSocket Ping", value: `${client.ws.ping}ms`, inline: true },
        { name: "Endpoint Ping", value: ":bar_chart: 計測中...", inline: true },
        {
          name: "稼働時間",
          value: `<t:${startTimestamp}:R>`,
          inline: true,
        }
      )
      .setThumbnail(client.user.displayAvatarURL())
      .setTimestamp();

    const replyMessage = await interaction.reply({
      embeds: [aboutEmbed],
      fetchReply: true,
    });

    const endpointPing = Date.now() - replyMessage.createdTimestamp;
    const updatedEmbed = EmbedBuilder.from(aboutEmbed).spliceFields(1, 1, {
      name: "Endpoint Ping",
      value: `${endpointPing}ms`,
      inline: true,
    });
    await interaction.editReply({
      embeds: [updatedEmbed],
    });
  },
};

export default aboutCommand;
