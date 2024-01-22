import { Collection } from 'discord.js';
import { pathToFileURL } from 'url';
import { join } from 'path';
import { readdirSync } from 'fs';

const commands = new Collection();

const commandsPath = join(import.meta.dirname, 'commands');

const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.mjs'));
for (const file of commandFiles) {
	const filePath = join(commandsPath, file);
	const command = await import(pathToFileURL(filePath));
	if ('data' in command && 'execute' in command)
		commands.set(command.data.name, command);
	else
		console.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
}

export { commands };
