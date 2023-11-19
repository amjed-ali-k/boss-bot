import { Client, Events } from "discord.js";

interface Event {
  name: Events;
  once: boolean;
  execute: (client: Client) => void;
}

const event: Event = {
  name: Events.ClientReady,
  once: true,
  execute(client: Client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};

export default event;
