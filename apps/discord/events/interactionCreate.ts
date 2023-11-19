import { Events, type Interaction } from "discord.js";

interface Command {
  execute: (interaction: Interaction) => Promise<void>;
}

interface CommandCollection {
  get: (name: string) => Command;
}

interface ClientWithCommands {
  commands: CommandCollection;
}

type InteractionWithCommandClient = {
  client: ClientWithCommands;
} & Interaction;

export const interactionCreate = {
  name: Events.InteractionCreate,
  async execute(interaction: InteractionWithCommandClient) {
    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}`);
      console.error(error);
    }
  },
};
