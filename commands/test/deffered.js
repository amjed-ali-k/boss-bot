const { SlashCommandBuilder } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("deffered")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    await interaction.deferReply();
    await wait(4000);
    await interaction.editReply("Pong!");
    // const message = await interaction.fetchReply();
    // console.log(message);
    await wait(5000);
    await interaction.deleteReply();
  },
};
