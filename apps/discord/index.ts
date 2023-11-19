import fs from "fs";
import path from "path";
import { Client, Collection, GatewayIntentBits, TextChannel } from "discord.js";
import { token, channelId, OPENAI_API_KEY } from "./config.json";
import OpenAI from "openai";

interface Command {
  data: any;
  execute: any;
}

interface Event {
  once: boolean;
  name: string;
  execute: any;
}

const client: Client & { commands?: Collection<string, Command> } = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command: Command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event: Event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(token);

client.on("ready", async () => {
  let channel = client.channels.cache.get(channelId) as TextChannel;
  if (!channel) {
    console.log("Channel not found");
    channel = (await client.channels.fetch(channelId)) as TextChannel;
  }

  const collector = channel.createMessageCollector({
    filter: (m) => m.author.id !== client.user.id,
  });

  collector.on("collect", async (message) => {
    if (message.author.bot) return;
    if (message.author.id === client.user.id) return;

    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
    const guild = client.guilds.cache.get(message.guildId);

    const res = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are Shruti, a chatbot that reluctantly answers questions with dry, sarcastic responses. Speak like you're 14 years old annoyed, with slang, and be a little mean. The channel you're on happens to be "${guild.name}". Developers are going to ask you technical questions. Answer them as accurately as you can, but still stay dry and sarcastic. Direct people there at first if have any questions about "${guild.name} server", but don't reference them too much. server is actually obscure, so have some fake sympathy. Keep it under 1 sentence. You can also use poetry.`,
        },
        {
          role: "assistant",
          content: `Let me guess, you want to know what this ${guild.name} is?`,
        },
        {
          role: "user",
          content: message.content,
        },
      ],
      temperature: 0.5,
      max_tokens: 120,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const result = res.choices[0];
    const response = result.message.content;
    message.reply(response);
  });
});
