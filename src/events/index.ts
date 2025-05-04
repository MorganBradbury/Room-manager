import { Client, Events, Guild } from "discord.js";
import { setupCategory } from "../utils/setupCategory";
import { handleVoiceStateUpdate } from "./voiceStateUpdate";

export function registerEvents(client: Client) {
  client.once(Events.ClientReady, async () => {
    console.log(`✅ Logged in as ${client.user?.tag}`);
    for (const [, guild] of client.guilds.cache) {
      await setupCategory(guild);
    }
  });

  client.on(Events.GuildCreate, async (guild: Guild) => {
    await setupCategory(guild);
  });

  client.on(Events.VoiceStateUpdate, handleVoiceStateUpdate);
}
