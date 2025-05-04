import { ChannelType, CategoryChannel, Guild, Events } from "discord.js";
import client from "../client";

const CATEGORY_NAME = "🔊 Voice rooms";
const CREATE_CHANNEL_NAME = "➕┃Create room";

async function setupCategory(guild: Guild): Promise<void> {
  const existingCategory = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildCategory && c.name === CATEGORY_NAME
  ) as CategoryChannel | undefined;

  if (existingCategory) {
    const children = guild.channels.cache.filter(
      (c) => c.parentId === existingCategory.id
    );
    for (const [, child] of children) {
      await child.delete().catch(console.error);
    }
    await existingCategory.delete().catch(console.error);
  }

  const newCategory = await guild.channels.create({
    name: CATEGORY_NAME,
    type: ChannelType.GuildCategory,
  });

  await guild.channels.create({
    name: CREATE_CHANNEL_NAME,
    type: ChannelType.GuildVoice,
    parent: newCategory.id,
  });
}

// Register on bot ready
client.once(Events.ClientReady, async () => {
  console.log("✅ Client ready — setting up categories...");
  for (const [, guild] of client.guilds.cache) {
    await setupCategory(guild);
  }
});

// Register on new guild join
client.on(Events.GuildCreate, async (guild: Guild) => {
  await setupCategory(guild);
});
