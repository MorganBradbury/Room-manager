import {
  VoiceState,
  ChannelType,
  VoiceChannel,
  CategoryChannel,
} from "discord.js";
import client from "../client";

// const CATEGORY_NAME = "🔊 Voice rooms";
const CATEGORY_NAME = "Voice rooms";
const CREATE_CHANNEL_NAME = "➕┃Create room";
const ROOM_PREFIX = "🔊┃Room #";

client.on(
  "voiceStateUpdate",
  async (oldState: VoiceState, newState: VoiceState) => {
    const guild = newState.guild;
    const category = guild.channels.cache.find(
      (c) => c.type === ChannelType.GuildCategory && c.name === CATEGORY_NAME
    ) as CategoryChannel | undefined;
    if (!category) return;

    const createChannel = guild.channels.cache.find(
      (c) =>
        c.parentId === category.id &&
        c.name === CREATE_CHANNEL_NAME &&
        c.type === ChannelType.GuildVoice
    ) as VoiceChannel | undefined;
    if (!createChannel) return;

    if (
      newState.channelId === createChannel.id &&
      oldState.channelId !== createChannel.id
    ) {
      const existingRooms = guild.channels.cache
        .filter(
          (c): c is VoiceChannel =>
            c.type === ChannelType.GuildVoice &&
            c.parentId === category.id &&
            c.name.startsWith(ROOM_PREFIX) &&
            c.id !== createChannel.id
        )
        .sort((a, b) => a.rawPosition - b.rawPosition);

      const roomNumber = existingRooms.size + 1;
      const newRoom = await guild.channels.create({
        name: `${ROOM_PREFIX}${roomNumber}`,
        type: ChannelType.GuildVoice,
        parent: category.id,
      });

      for (const [, member] of createChannel.members) {
        await member.voice.setChannel(newRoom).catch(console.error);
      }
    }

    const justLeft = oldState.channel;
    if (
      justLeft &&
      justLeft.parentId === category.id &&
      justLeft.name.startsWith(ROOM_PREFIX) &&
      justLeft.members.size === 0
    ) {
      await justLeft.delete().catch(console.error);
    }
  }
);
