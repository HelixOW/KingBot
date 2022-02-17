import { Client, Collection, Intents } from "discord.js"

import { readUnitsFromDatabase, readBannersFromDatabase, initiateProfileTable, initiateDemonTeamTable, initiateGameUnitTable } from './utils/database_helper';

import path = require("path")
import fs = require("fs")
import { ErrorEmbed } from './utils/embeds';

const { token } = require("./data/config.json")

export const client : Client = new Client({intents: [Intents.FLAGS.GUILDS]});

let commandFiles : {path: string, osFile: string}[] = []

function readCommandsFolderRec(dir: string) {
    fs.readdirSync(dir).forEach(file => {
        const abs = path.join(dir, file);
        if (fs.statSync(abs).isDirectory()) 
            return readCommandsFolderRec(abs);
        else 
            return commandFiles.push({
                path: dir.replace("\\", "/"),
                osFile: file
            });
    });
}

readCommandsFolderRec("commands")

commandFiles = commandFiles.filter(commandFile => commandFile.osFile.endsWith('.ts'))
const commands: Collection<String, any> = new Collection<String, any>();

commandFiles.forEach(async (commandFile: {path: string, osFile: string}) => {
    const command = await import("./" + commandFile.path + "/" + commandFile.osFile)

    commands.set(command.data.name, command)
})

client.once('ready', async () => {
    initiateProfileTable()
    initiateDemonTeamTable()
    initiateGameUnitTable()

    await readUnitsFromDatabase()
    await readBannersFromDatabase()

    console.log('Ready!')
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = commands.get(interaction.commandName);

    if (!command) return; 

    try {  
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ 
            content: 'There was an error while executing this command!',
            ephemeral: true,
            embeds: [new ErrorEmbed((error as Error).message)]
        });
    }
});

client.login(token)