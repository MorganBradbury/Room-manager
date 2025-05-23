import { Client, GatewayIntentBits, Partials } from "discord.js";
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [],
});

(async () => {
  try {
    await client.login(process.env.DISCORD_TOKEN!);
    console.log("✅ Room manager connected");
  } catch (error) {
    console.error("Error logging in to Discord:", error);
  }
})();

export default client;
