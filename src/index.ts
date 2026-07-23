import { loadEnvFile } from 'node:process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import { Client, Collection, Events, GatewayIntentBits, MessageFlags } from 'discord.js';

import type { Command } from './types/command.js';

loadEnvFile();

class DiscordClient extends Client {
	commands = new Collection<string, Command>();
}

const client = new DiscordClient({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const foldersPath = join(import.meta.dirname, 'commands');
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = join(foldersPath, folder);
	const commandFiles = readdirSync(commandsPath)
		.filter(file => (file.endsWith('.js') || file.endsWith('.ts')) && !file.endsWith('.d.ts'));
	for (const file of commandFiles) {
		const filePath = join(commandsPath, file);

		const module = await import(filePath);
		const cmd: Command = module.default;

		client.commands.set(cmd.data.name, cmd);
	}
}

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const discordClient = interaction.client as DiscordClient;
	const command = discordClient.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

client.login(process.env.TOKEN);
