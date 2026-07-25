import { InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types/command.js';

export default {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Ban specified user')
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.addUserOption((option) => 
			option
				.setName('target')
				.setDescription('User to ban')
				.setRequired(true))
		.addStringOption((option) =>
			option
				.setName('reason')
				.setDescription('Reason for ban')
				.setRequired(false))
		.setContexts(InteractionContextType.Guild),
	async execute(interaction) {
		const user = interaction.options.getUser('target', true);
		const reason = interaction.options.getString('reason') ?? 'No reason provided';

		if (!interaction.guild) return;

		const target = await interaction.guild.members.fetch(user);
		if (!target.bannable) {
			await interaction.reply({
				content: `User ${user.username} cannot be banned by you!`,
				flags: MessageFlags.Ephemeral
			});
			return;
		}

		await target.ban({ reason });
		await interaction.reply(`User ${user.username} is banned with reason: '${reason}'`);
	}
} satisfies Command;
