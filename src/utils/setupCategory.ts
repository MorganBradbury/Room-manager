import { Guild, ChannelType, CategoryChannel } from "discord.js";

const CATEGORY_NAME = "🔊 Voice rooms";
const CREATE_CHANNEL_NAME = "➕┃Create room";

export async function setupCategory(guild: Guild): Promise<void> {
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
