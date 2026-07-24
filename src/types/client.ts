import { Client, Collection } from 'discord.js';
import type { Command } from './command.js';

export class DiscordClient extends Client {
	commands = new Collection<string, Command>();
}
