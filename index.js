const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { commands } = require('./command-router.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async (client) => {
	console.log(`Client ready: ${client.user.tag}`)

	await client.application.commands.set(commands.map((x) => x.data), '')
});

client.on(Events.InteractionCreate, async (interaction) => {
	console.debug(interaction);
	if (interaction.isButton()) {
		for (const command of commands.values())
			if ('onButton' in command)
				command.onButton(interaction);
		return;
	}

	if (!interaction.isChatInputCommand())
		return;

	const commandName = interaction.commandName;
	const command = commands.get(commandName);

	if (!command) {
		console.error(`Command not found: ${commandName}`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
	}
});

client.login(token);
