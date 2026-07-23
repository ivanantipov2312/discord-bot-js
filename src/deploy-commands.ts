import { REST, Routes } from 'discord.js';
import { loadEnvFile } from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
import type { Command } from './types/command.js';

loadEnvFile();

const { TOKEN, GUILD_ID, CLIENT_ID } = process.env;
if (!TOKEN || !GUILD_ID || !CLIENT_ID) {
	throw new Error('token, guild id or client id missing from ENV!');
}

const commands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(import.meta.dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const module = await import(filePath);
		const command: Command = module.default;
		commands.push(command.data.toJSON());
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(TOKEN);


// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });

		console.log(`Successfully reloaded ${data} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
