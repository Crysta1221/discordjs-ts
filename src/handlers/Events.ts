import type { Client } from "discord.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async (client: Client) => {
  try {
    const eventsPath = path.join(__dirname, "../events");
    const folders = await fs.readdir(eventsPath);

    for (const folder of folders) {
      const folderPath = path.join(eventsPath, folder);
      const stat = await fs.stat(folderPath);

      if (stat.isDirectory()) {
        const eventFiles = (await fs.readdir(folderPath)).filter((file) =>
          file.endsWith(".ts")
        );

        for (const file of eventFiles) {
          const filePath = path.join(folderPath, file);

          // Dynamically import the event module
          const eventModule = await import(filePath);
          const event = eventModule.default;

          if (event && event.name && event.execute) {
            if (event.once) {
              client.once(event.name, (...args: any[]) =>
                event.execute(client, ...args)
              );
            } else {
              client.on(event.name, (...args: any[]) =>
                event.execute(client, ...args)
              );
            }
          } else {
            console.warn(
              `The event at ${filePath} is missing a required "name" or "execute" property.`
            );
          }
        }
      }
    }
  } catch (error) {
    console.error("Error loading events:", error);
  }
};
