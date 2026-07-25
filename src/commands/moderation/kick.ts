import { InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types/command.js';

export default {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Kick specified user')
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
		.addUserOption((option) => 
			option
				.setName('target')
				.setDescription('User to kick')
				.setRequired(true))
		.addStringOption((option) =>
			option
				.setName('reason')
				.setDescription('Reason for kick')
				.setRequired(false))
		.setContexts(InteractionContextType.Guild),
	async execute(interaction) {
		const user = interaction.options.getUser('target', true);
		const reason = interaction.options.getString('reason') ?? 'No reason provided';

		if (!interaction.guild) return;

		const target = await interaction.guild.members.fetch(user);
		if (!target.kickable) {
			await interaction.reply({
				content: `User ${user.username} cannot be kicked by you!`,
				flags: MessageFlags.Ephemeral
			});
			return;
		}

		await target.kick(reason);
		await interaction.reply(`User ${user.username} is kicked with reason: '${reason}'`);
	}
} satisfies Command;
