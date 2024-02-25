import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Review } from '../models/review.mjs';

export const data = new SlashCommandBuilder()
	.setName('stats')
	.setDescription('View your learning statistics.');

export async function execute(interaction) {
	const embed = new EmbedBuilder()
		.setTitle(`${interaction.user.displayName}'s statistics`)
		.setColor(0x0099ff)
		.addFields(
			{
				name: "Current streak",
				value: (await Review.getUserStreak(interaction.user.id)).toString(),
			},
			{
				name: "Reviewed today",
				value: (await Review.getReviewCountByUserToday(interaction.user.id)).toString(),
			}
		);

	await interaction.reply({ embeds: [embed], ephemeral: true });
}
