import { Client, GatewayIntentBits, Partials } from "discord.js";
import { registerEvents } from "./events";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.GuildMember, Partials.Channel],
});

(async () => {
  try {
    await client.login(process.env.DISCORD_TOKEN!);
    console.log("✅ Room manager logged in successfully!");
    registerEvents(client);
  } catch (error) {
    console.error("Error logging in to Discord:", error);
  }
})();

export default client;
