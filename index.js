const {Client, Collection, Intents} = require('discord.js');
const {token} = require('./config.json');
const fs = require("fs");
const database_helper = require('./utils/database_helper.js')

const client = new Client({intents: [Intents.FLAGS.GUILDS]});

module.exports = {
    client: client
}

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.data.name, command)
}

client.once('ready', async () => {
    await database_helper.read_affections_from_db()
    await database_helper.read_units_from_db()

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