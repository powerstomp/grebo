import {
	SlashCommandBuilder, ActionRowBuilder,
	ButtonBuilder, ButtonStyle, EmbedBuilder
} from 'discord.js';
import { Session } from '../models/session.mjs'

const learningSessions = new Map();

function createFlashcardEmbed(card, showBack) {
	const embed = new EmbedBuilder()
		.setTitle(card.front)
		.setColor(showBack ? 0x00ff00 : 0x0099ff);

	if (showBack)
		embed.setDescription(card.back);

	return embed;
}

function createFlashcardMessage(card, showBack) {
	const embed = createFlashcardEmbed(card, showBack);
	const row = new ActionRowBuilder();

	if (!showBack) {
		row.addComponents(
			new ButtonBuilder()
				.setCustomId('Reveal')
				.setStyle(ButtonStyle.Primary)
				.setEmoji('👁️'),
		);
	} else {
		row.addComponents(
			new ButtonBuilder()
				.setCustomId('Pass')
				.setStyle(ButtonStyle.Success)
				.setEmoji('👍'),
			new ButtonBuilder()
				.setCustomId('Fail')
				.setStyle(ButtonStyle.Danger)
				.setEmoji('👎'),
		);
	}

	return { embeds: [embed], components: [row], ephemeral: true };
}

function createCompletionMessage(session) {
	const embed = new EmbedBuilder()
		.setTitle("Session complete!")
		.setColor(0x00ffff)
		.addFields(
			{
				name: "Passed",
				value: session.score.pass.toString(),
				inline: true,
			},
			{
				name: "Failed",
				value: session.score.fail.toString(),
				inline: true,
			},
			{
				name: "Retention Rate",
				value: session.score.retention.toLocaleString(undefined, { style: 'percent' }),
				inline: true,
			}
		);
	return { embeds: [embed], components: [], ephemeral: true, };
}

export const data = new SlashCommandBuilder().setName('start').setDescription('Start a new learning session.');
export async function execute(interaction) {
	const userID = interaction.user.id;

	if (learningSessions.has(userID)) {
		await interaction.reply({
			content: 'You already have an active learning session. Finish that one or use /stop.',
			ephemeral: true,
		});
		return;
	}

	const session = new Session({ userID });

	const card = await session.nextCard();
	if (!card) {
		await interaction.reply({ content: 'No card available.', ephemeral: true });
		return;
	}

	learningSessions.set(userID, session);

	const messageData = createFlashcardMessage(card, false);
	await interaction.reply(messageData);
}
export async function onButton(interaction) {
	const userID = interaction.user.id;
	const session = learningSessions.get(userID);
	if (!session) return;

	const currentCard = session.currentCard;

	if (interaction.customId === 'Reveal') {
		const messageData = createFlashcardMessage(currentCard, true, session);
		await interaction.update(messageData);
	} else if (interaction.customId === 'Pass' ||
		interaction.customId === 'Fail') {
		const tmp = await session.grade(interaction.customId);
		if (typeof tmp !== 'boolean')
			throw new Error(`Unexpected session grade response: ${tmp}`);

		const nextCard = await session.nextCard();
		if (!nextCard) {
			learningSessions.delete(userID);
			await interaction.update(createCompletionMessage(session));
			return;
		}

		const messageData = createFlashcardMessage(nextCard, false, session);
		await interaction.update(messageData);
	}
}
