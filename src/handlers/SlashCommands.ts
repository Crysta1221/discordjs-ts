// src/handlers/SlashCommands.ts
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import config from "../../config.json" assert { type: "json" };
import { pathToFileURL } from "url";
import fs from "fs/promises";
import path from "path";
import type { Client } from "discord.js";

export default async (client: Client) => {
  try {
    const results: { command: string; status: string }[] = [];
    const commandsPath = path.resolve("./src/commands");
    const folders = await fs.readdir(commandsPath);

    const commands = [];

    for (const folder of folders) {
      const folderPath = path.join(commandsPath, folder);
      const stat = await fs.stat(folderPath);

      if (stat.isDirectory()) {
        const files = await fs.readdir(folderPath);
        const commandFiles = files.filter(
          (file) => file.endsWith(".ts") || file.endsWith(".js")
        );

        for (const file of commandFiles) {
          const filePath = path.join(folderPath, file);
          const fileURL = pathToFileURL(filePath).href;

          try {
            const commandModule = await import(fileURL);
            const command = commandModule.default;

            if (
              command &&
              command.name &&
              typeof command.execute === "function"
            ) {
              client.slashCommands.set(command.name, command);
              results.push({ command: `/${command.name}`, status: "✅" });
              commands.push(command);
            } else {
              results.push({ command: `/${command.name}`, status: "❌" });
              console.warn(`Command "${file}" is missing required properties.`);
            }
          } catch (importError) {
            console.error(`Failed to load command "${file}":`, importError);
            results.push({ command: file, status: "❌" });
          }
        }
      }
    }

    const token: string | undefined = config.token;
    const clientId: string = config.client.id;

    if (!token) {
      throw new Error("Bot token is not defined in configuration.");
    }

    const rest = new REST({ version: "10" }).setToken(token);

    // Register Global Commands
    try {
      await rest.put(Routes.applicationCommands(clientId), {
        body: commands.map(({ execute, ...data }) => data),
      });
      console.log("Successfully registered global application commands.");
    } catch (error) {
      console.error("Error registering global commands:", error);
    }

    // Register Guild Commands
    const guildIds = client.guilds.cache.map((guild) => guild.id);

    // Register commands for each guild
    for (const guildId of guildIds) {
      try {
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
          body: commands.map(({ execute, ...data }) => data),
        });
        console.log(`Successfully registered commands for guild ${guildId}.`);
      } catch (error) {
        console.error(
          `Error registering commands for guild ${guildId}:`,
          error
        );
      }
    }

    console.log("Successfully registered application commands for all guilds.");
    console.table(results);
    console.log(`Successfully reloaded ${commands.length} slash commands!`);
  } catch (error) {
    console.error("Error loading slash commands:", error);
  }
};
