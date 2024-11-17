import type { Client } from "discord.js";
import { ActivityType } from "discord.js";

export default {
  name: "ready",
  once: true,
  execute(client: Client) {
    if (!client.user) throw new Error("Client is not logged in");

    console.log(`Logged in as ${client.user.tag}`);
    client.user.setStatus("online");
  },
};
