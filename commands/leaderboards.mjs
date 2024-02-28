import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Review } from '../models/review.mjs';

export const data = new SlashCommandBuilder()
	.setName('leaderboards')
	.setDescription('View the leaderboards.');

export async function execute(interaction) {
	const topReviews = await Review.getTopMostReviewsToday(10);

	const embed = new EmbedBuilder()
		.setTitle('Top 10 users by reviews today')
		.setColor(0x0099ff);

	let description = '';
	for (const [index, entry] of topReviews.entries()) {
		const user = await interaction.client.users.fetch(entry.userid);
		description += `${index + 1}. ${user.displayName} - **${entry.reviewcount}**\n`;
	}
	embed.setDescription(description);

	await interaction.reply({ embeds: [embed], ephemeral: true });
}
