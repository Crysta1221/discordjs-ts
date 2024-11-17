// client.d.ts
import { Client, Collection, CommandInteraction, Event } from "discord.js";

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>;
    events: Collection<string, Event>;
    slashCommands: Collection<string, SlashCommand>;
  }
}

interface Command {
  name: string;
  execute: (interaction: CommandInteraction) => Promise<void>;
}

interface Event {
  name: string;
  once: boolean;
  execute: (...args: any[]) => void;
}

interface SlashCommand {
  name: string;
  description: string;
  execute: (interaction: CommandInteraction) => Promise<void>;
}
