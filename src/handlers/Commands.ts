import type { Client } from "discord.js";
import fs from "fs/promises";

const Commands = async (client: Client) => {
  try {
    const results: { file: string; status: string }[] = [];
    const folders = await fs.readdir("./src/commands");

    for (const folder of folders) {
      const commandFiles = (
        await fs.readdir(`./src/commands/${folder}`)
      ).filter((file) => file.endsWith(".ts"));

      for (const file of commandFiles) {
        try {
          const commandModule = await import(`../commands/${folder}/${file}`);
          const command = commandModule.default;

          if (command && command.name) {
            client.commands.set(command.name, command);
            results.push({ file, status: "✅" });
          } else {
            results.push({ file, status: "❌" });
          }
        } catch (importError) {
          console.error(`Failed to load command "${file}":`, importError);
          results.push({ file, status: "❌" });
        }
      }
    }
    console.log("SlashCommand File Validation:");
    console.table(results);
  } catch (error) {
    console.error("Error loading commands:", error);
  }
};

export default Commands;
