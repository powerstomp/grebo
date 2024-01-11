const router = require('./command-router.js');

const commands = [];

for (const value of router.commands)
	commands.push(value[1].data.toJSON())

const { REST, Routes } = require('discord.js');
const { applicationId, guildId, token } = require('./config.json');

const rest = new REST().setToken(token);

(async () => {
	try {
		const data = await rest.put(Routes.applicationGuildCommands(applicationId, guildId),
			{ body: commands });
		console.log(data);
	}
	catch (error) {
		console.error(error);
	}
})();
