import { Client, Events } from "discord.js";
import { log } from "../utils/logger";

interface Event {
  name: Events;
  once: boolean;
  execute: (client: Client) => void;
}

export const event: Event = {
  name: Events.ClientReady,
  once: true,
  execute(client: Client) {
    log(`Ready! Logged in as ${client.user.tag}`);
  },
};
export default event;
