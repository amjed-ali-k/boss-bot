const { SlashCommandBuilder } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;

module.exports = {
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
    await wait(4000);
    await interaction.editReply("Pong!");
    const user = await interaction.client.users.fetch(interaction.user.id);
    console.log(user);
    console.log(interaction);
    // const message = await interaction.fetchReply();
    // console.log(message);
    await wait(5000);
    await interaction.deleteReply();
  },
};
