import { Client, GatewayIntentBits, Partials, Options } from "discord.js";
import dotenv from "dotenv";
import { registerEvents } from "./events";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

client.login(process.env.DISCORD_TOKEN);
