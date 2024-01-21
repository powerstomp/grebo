const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('ping').setDescription('Test if bot is working.'),
	async execute(interaction) {
		await interaction.reply('pong')
	},
};
