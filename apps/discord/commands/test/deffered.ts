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
    .setName("deffered")
    .setDescription("Replies with Pong!")
    .addStringOption((option) =>
      option
        .setName("string")
        .setDescription("A string to test")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    await setTimeout(4000);
    await interaction.editReply("Pong!");
    const user = await interaction.client.users.fetch(interaction.user.id);
    console.log(user);
    console.log(interaction);
    // const message = await interaction.fetchReply();
    // console.log(message);
    await setTimeout(5000);
    await interaction.deleteReply();
  },
};

export default command;
