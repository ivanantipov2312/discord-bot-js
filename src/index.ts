import { loadEnvFile } from 'node:process';
import fs from 'node:fs';
import path from 'node:path';

import { Collection, GatewayIntentBits } from 'discord.js';

import { DiscordClient } from './types/client.js';
import type { Event } from './types/event.js';
import type { Command } from './types/command.js';

loadEnvFile();

const client = new DiscordClient({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const foldersPath = path.join(import.meta.dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath)
		.filter(file => (file.endsWith('.js') || file.endsWith('.ts')) && !file.endsWith('.d.ts'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);

		const module = await import(filePath);
		const cmd: Command = module.default;

		client.commands.set(cmd.data.name, cmd);
	}
}

const eventsPath = path.join(import.meta.dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath)
	.filter((file) => (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);

	const module = await import(filePath);
	const event: Event = module.default;

	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(process.env.TOKEN);
