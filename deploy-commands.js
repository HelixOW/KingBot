const {REST} = require('@discordjs/rest')
const {Routes} = require('discord-api-types/v9')
const {token, clientId} = require('./data/config.json')
const fs = require("fs")
const path = require("path")

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
const commands = []

for (const file of commandFiles) {
    const command = require("./" + file.path + "/" + file.file);

    commands.push(command.data.toJSON())
}

const rest = new REST({version: '9'}).setToken(token);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(clientId, "812695655852015628"),
            //Routes.applicationCommands(clientId),
            {body: commands}
        );

        console.log("Successfully registered application commands.")
    } catch (e) {
        console.error(e)
    }
})();