import { Client, Events, Message, TextChannel } from "discord.js";
import { log } from "../utils/logger";
import { channelId, OPENAI_API_KEY, guildId } from "./../config.json";
import OpenAI from "openai";
import { draw } from "radash";
import { overlimit } from "../data/overflow.json";

interface Event {
  name: Events;
  once: boolean;
  execute: (client: Client) => void;
}

const subscribed: { guildId: string; channelIds: string[] }[] = [
  { guildId, channelIds: [channelId] },
];

export const event: Event = {
  name: Events.ClientReady,
  once: true,
  execute: (client: Client) => {
    subscribed.forEach((glds) => {
      const guild = client.guilds.cache.get(glds.guildId);

      glds.channelIds.forEach((channelId) => {
        const channel = guild.channels.cache.get(channelId) as TextChannel;

        const collector = channel.createMessageCollector({
          filter: (m) => m.author.id !== client.user.id,
        });

        collector.on("collect", async (message) => {
          if (message.author.bot) return;
          if (message.author.id === client.user.id) return;

          // message content is empty
          if (message.content.length === 0) return;

          if (message.content.length === 1) {
            message.reply(`Just ${message.content}?`);
          }

          // message content is too long
          if (message.content.length > 150) {
            message.reply(draw(overlimit));
            return;
          }
          log(`[DEBUG] ${message.author.username} said: ${message.content}`);
          log(message.content.length);
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
    });
  },
};

export default event;
