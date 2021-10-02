const {Client, Collection, Intents} = require('discord.js');
const {token} = require('./data/config.json');
const fs = require("fs");
const path = require("path")
const database_helper = require('./utils/database_helper.js')

const client = new Client({intents: [Intents.FLAGS.GUILDS]});

module.exports = {
    client: client
}

let commandFiles = []

function readCommandsFolderRec(dir) {
    fs.readdirSync(dir).forEach(file => {
        const abs = path.join(dir, file);
        if (fs.statSync(abs).isDirectory()) return readCommandsFolderRec(abs);
        else return commandFiles.push({
            "path": dir.replace("\\", "/"), "file": file
        });
    });
}

readCommandsFolderRec("commands")

commandFiles = commandFiles.filter(file => file.file.endsWith('.js'))
client.commands = new Collection();

for (const file of commandFiles) {
    const command = require("./" + file.path + "/" + file.file);

    client.commands.set(command.data.name, command)
}

client.once('ready', async () => {
    database_helper.read_affections_from_db()
    await database_helper.read_units_from_db()
    await database_helper.read_banners_from_db()

    console.log('Ready!')
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(token)