import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Test if bot is working.');
export async function execute(interaction) {
	await interaction.reply('pong');
}
