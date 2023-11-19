import { Client, Events, Message, TextChannel } from "discord.js";
import { log } from "../utils/logger";
import { OPENAI_API_KEY } from "./../config.json";
import OpenAI from "openai";
import { draw } from "radash";
import { overlimit } from "../data/overflow.json";
import db from "./../db/db";

interface Event {
  name: Events;
  once: boolean;
  execute: (client: Client) => void;
}

export const event: Event = {
  name: Events.ClientReady,
  once: true,
  execute: async (client: Client) => {
    const channels = await db.channel.findMany({
      where: {
        disabled: false,
      },
    });

    channels.forEach((chnl) => {
      client.channels.cache.get(chnl.id);
      const channel = client.channels.cache.get(chnl.id) as TextChannel;

      const collector = channel.createMessageCollector({
        filter: (m) => m.author.id !== client.user.id,
      });

      collector.on("collect", async (message) => {
        let unresolvedPromises: Promise<any>[] = [];
        // Skip all other bot messages
        if (message.author.bot && message.author.id !== client.user.id) return;

        // Message content is empty
        if (message.content.length === 0) return;

        if (message.content.length === 1) {
          message.reply(`Just ${message.content}?`);
        }

        // Message content is too long + this doesn't store on db. If it is in db, it will be attached with prompts also, I don't want that much OpenAPI bill.
        if (message.content.length > 150) {
          message.reply(draw(overlimit));
          return;
        }

        if (message.author.id === client.user.id) {
          return;
        }

        // Store message in the db
        unresolvedPromises.push(
          db.channelMessage.create({
            data: {
              content: message.content,
              userId: message.author.id,
              userName: message.author.username,
              channelId: chnl.id,
            },
          })
        );

        // fetch messages
        const prevMessages = (
          await db.channelMessage.findMany({
            orderBy: {
              createdAt: "desc",
            },
            where: {
              channelId: chnl.id,
              userId: {
                in: [client.user.id, message.author.id],
              },
            },
            take: 10,
          })
        ).map((m) => ({
          role: m.userId === client.user.id ? "assistant" : "user",
          content: m.content,
        }));

        log(`[DEBUG] ${message.author.username} said: ${message.content}`);
        const openai = new OpenAI({
          apiKey: OPENAI_API_KEY,
        });
        const guild = client.guilds.cache.get(message.guildId);

        console.log(JSON.stringify(prevMessages, null, 2));

        const res = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are Shruti, a chatbot that reluctantly answers questions with dry, sarcastic responses. Speak like you're 14 years old annoyed, with slang, and be a little mean. The channel you're on happens to be "${channel.name}" in "${guild.name} Discord Server". Users are going to ask you questions. Answer them as accurately as you can, but still stay dry and sarcastic. Direct people there at first if have any questions about "${guild.name} server", but don't reference them too much. Server is actually obscure, so have some fake sympathy. Keep it under 1 sentence. You can also use poetry.`,
            },
            {
              role: "assistant",
              content: `Let me guess, you want to know what this ${guild.name} is?`,
            },
            {
              role: "user",
              content: message.content,
            },
            ...(prevMessages as any[]),
          ],
          temperature: 0.5,
          max_tokens: 120,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        });

        const result = res.choices[0];
        const response = result.message.content;
        unresolvedPromises.push(
          db.channelMessage.create({
            data: {
              content: response,
              userId: client.user.id,
              userName: client.user.username,
              channelId: chnl.id,
            },
          })
        );
        message.reply(response);
        await Promise.all(unresolvedPromises);
      });
    });
  },
};

export default event;
