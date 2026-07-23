import { loadEnvFile } from 'node:process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import { Client, Collection, Events, GatewayIntentBits, MessageFlags } from 'discord.js';

loadEnvFile();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const foldersPath = join(import.meta.dirname, 'commands');
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = join(foldersPath, folder);
	const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = join(commandsPath, file);
		import(filePath).then(module => {
			const { default: cmd } = module;
			if ('data' in cmd && 'execute' in cmd) {
				client.commands.set(cmd.data.name, cmd);
			} else {
				console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		});
	}
}

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

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
