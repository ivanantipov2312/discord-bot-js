import { InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types/command.js';

export default {
	data: new SlashCommandBuilder()
		.setName('unban')
		.setDescription('Unban specified user')
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.addUserOption((option) => 
			option
				.setName('target')
				.setDescription('User to unban')
				.setRequired(true))
		.setContexts(InteractionContextType.Guild),
	async execute(interaction) {
		const user = interaction.options.getUser('target', true);

		if (!interaction.guild) return;

		const target = await interaction.guild.bans.fetch(user).catch(() => null);
		if (!target) {
			await interaction.reply({
				content: `User ${user.username} is not banned!`,
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		await interaction.guild.members.unban(user);
		await interaction.reply(`User ${user.username} unbanned!`);
	}
} satisfies Command;
