import { Client, GatewayIntentBits, Collection } from "discord.js";
import * as config from "../config.json";

export const client: Client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();
client.events = new Collection();
client.slashCommands = new Collection();

// Handler Loader
const loadHandlers = async () => {
  const handlers = ["Commands", "Events", "SlashCommands"];

  for (const handler of handlers) {
    try {
      const handlerModule = await import(`./handlers/${handler}`);

      if (typeof handlerModule.default === "function") {
        await handlerModule.default(client);
      } else {
        console.warn(
          `Handler "${handler}" does not export a default function.`
        );
      }
    } catch (error) {
      console.error(`Failed to load handler "${handler}":`, error);
    }
  }
};

// Error Handler
process.on("unhandledRejection", (e) =>
  console.error("Unhandled Rejection:", e)
);
process.on("uncaughtException", (e) => console.error("Uncaught Exception:", e));
process.on("uncaughtExceptionMonitor", (e) =>
  console.error("Uncaught Exception Monitor:", e)
);

// Bot login
(async () => {
  try {
    // Load Slashcommand Handlers
    await loadHandlers();
    // Login to Discord API
    await client.login(config.token);
  } catch (err) {
    console.error("Error during startup:", err);
  }
})();
