import {
  Client,
  GatewayIntentBits,
  Events,
  ChannelType,
  VoiceChannel,
  Guild,
  VoiceState,
  CategoryChannel,
  Options,
} from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const CATEGORY_NAME = "🔊 Voice rooms";
const CREATE_CHANNEL_NAME = "➕┃Create room";
const ROOM_PREFIX = "🔊┃Room #";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  partials: [],

  makeCache: Options.cacheWithLimits({
    MessageManager: 0,
    GuildMemberManager: 0,
    PresenceManager: 0,
    ReactionManager: 0,
    ThreadManager: 0,
    VoiceStateManager: 10,
  }),

  sweepers: {
    messages: {
      interval: 300,
      lifetime: 60,
    },
    users: {
      interval: 300,
      filter: () => () => true,
    },
    guildMembers: {
      interval: 300,
      filter: () => () => true,
    },
  },
});

client.once(Events.ClientReady, async () => {
  console.log(`✅ Logged in as ${client.user?.tag}`);

  for (const [, guild] of client.guilds.cache) {
    await setupCategory(guild);
  }

  // Monitor memory usage
  setInterval(() => {
    const used = process.memoryUsage().rss / 1024 / 1024;
    console.log(`🧠 Memory usage: ${used.toFixed(2)} MB`);
  }, 10_000);
});

client.on(Events.GuildCreate, async (guild: Guild) => {
  await setupCategory(guild);
});

client.on(
  Events.VoiceStateUpdate,
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

    // User joins the create channel
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
        .sort((a, b) => a.position - b.position); // Use `.position` instead of `.rawPosition`

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

    // Delete empty rooms
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

async function setupCategory(guild: Guild): Promise<void> {
  const existingCategory = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildCategory && c.name === CATEGORY_NAME
  ) as CategoryChannel | undefined;

  if (existingCategory) {
    const existingPosition = existingCategory.position;

    const children = guild.channels.cache.filter(
      (c) => c.parentId === existingCategory.id
    );
    for (const [, child] of children) {
      await child.delete().catch(console.error);
    }
    await existingCategory.delete().catch(console.error);

    const newCategory = await guild.channels.create({
      name: CATEGORY_NAME,
      type: ChannelType.GuildCategory,
      position: existingPosition,
    });

    await guild.channels.create({
      name: CREATE_CHANNEL_NAME,
      type: ChannelType.GuildVoice,
      parent: newCategory.id,
    });
  } else {
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
}

client.login(process.env.DISCORD_TOKEN);
