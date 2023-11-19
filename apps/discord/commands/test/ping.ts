import { SlashCommandBuilder } from "discord.js";
import { setTimeout } from "node:timers/promises";

interface Command {
  cooldown: number;
  data: any;
  execute: (interaction: any) => Promise<void>;
}

const command: Command = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    await interaction.reply("Pong!");
    await setTimeout(2000);
    await interaction.editReply("Pong again!");
  },
};

export default command;
