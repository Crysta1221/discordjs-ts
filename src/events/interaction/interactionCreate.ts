import type { Client, Interaction, CommandInteraction } from "discord.js";

export default {
  name: "interactionCreate",
  async execute(client: Client, interaction: Interaction) {
    if (!interaction.isCommand()) return;
    if (!interaction.guild) return;

    const command = client.slashCommands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction as CommandInteraction);
    } catch (error) {
      console.error("Error executing command:", error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "コマンドの実行中にエラーが発生しました！",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "コマンドの実行中にエラーが発生しました！",
          ephemeral: true,
        });
      }
    }
  },
};
