import {
	SlashCommandBuilder, ActionRowBuilder,
	ButtonBuilder, ButtonStyle, EmbedBuilder
} from 'discord.js';

const flashcards = [
	{ front: "1 + 1 = ?", back: "2" },
	{ front: "(-1)^3 = ?", back: "-1" },
];

const learningSessions = new Map();

function createFlashcardEmbed(card, showBack = false, session = null) {
	const embed = new EmbedBuilder()
		.setTitle(card.front)
		.setColor(showBack ? 0x00ff00 : 0x0099ff);

	if (showBack)
		embed.setDescription(card.back);

	return embed;
}

function createFlashcardMessage(card, showBack = false, session = null) {
	const embed = createFlashcardEmbed(card, showBack, session);
	const row = new ActionRowBuilder();

	if (!showBack) {
		row.addComponents(
			new ButtonBuilder()
				.setCustomId('reveal')
				// .setLabel('Reveal Back')
				.setStyle(ButtonStyle.Primary)
				.setEmoji('👁️'), // Eye emoji
		);
	} else {
		row.addComponents(
			new ButtonBuilder()
				.setCustomId('remembered')
				// .setLabel('Remembered')
				.setStyle(ButtonStyle.Success)
				.setEmoji('👍'),
			new ButtonBuilder()
				.setCustomId('forgot')
				// .setLabel('Forgot')
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
				name: "Remembered",
				value: session.score.remembered.toString(),
				inline: true,
			},
			{
				name: "Forgot",
				value: session.score.forgot.toString(),
				inline: true,
			},
			{
				name: "Retention rate",
				value: session.score.retentionRate.toLocaleString(undefined, { style: 'percent' }),
				inline: true,
			},
		);
	return { embeds: [embed], components: [], ephemeral: true, };
}

export const data = new SlashCommandBuilder().setName('start').setDescription('Start a new learning session.');
export async function execute(interaction) {
	const userId = interaction.user.id;

	if (learningSessions.has(userId)) {
		await interaction.reply({
			content: 'You already have an active learning session. Finish that one or use /stop.',
			ephemeral: true,
		});
		return;
	}

	const session = {
		cards: flashcards,
		currentCardIndex: 0,
		score: {
			remembered: 0, forgot: 0,
			get answered() { return this.remembered + this.forgot; },
			get retentionRate() { return this.remembered / this.answered; },
		},
	};
	learningSessions.set(userId, session);

	const firstCard = session.cards[session.currentCardIndex];
	const messageData = createFlashcardMessage(firstCard, false, session);
	await interaction.reply(messageData);
}
export async function onButton(interaction) {
	const userId = interaction.user.id;
	const session = learningSessions.get(userId);
	if (!session) return;

	const currentCard = session.cards[session.currentCardIndex];

	if (interaction.customId === 'reveal') {
		const messageData = createFlashcardMessage(currentCard, true, session);
		await interaction.update(messageData);
	} else if (interaction.customId === 'remembered' ||
		interaction.customId === 'forgot') {
		if (interaction.customId === 'remembered')
			session.score.remembered++;

		else
			session.score.forgot++;

		session.currentCardIndex++;

		if (session.currentCardIndex < session.cards.length) {
			const nextCard = session.cards[session.currentCardIndex];
			const messageData = createFlashcardMessage(nextCard, false, session);
			await interaction.update(messageData);
		} else {
			learningSessions.delete(userId);
			await interaction.update(createCompletionMessage(session));
		}
	}
}
