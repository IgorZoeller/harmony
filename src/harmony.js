console.clear();

require("dotenv").config();
const Client  = require("./structures/Client.js");
const Command = require("./structures/Command.js");
const fs = require("fs");
const config = require("./config/config.json");

const client = new Client();

let awaitingCommand = true;

fs.readdirSync("./src/commands")
    .filter(file => file.endsWith(".js"))
    .forEach(file => {
        /**
         * @type {Command}
         */
        const command = require(`./commands/${file}`);
        console.log(`Command ${command.name} now in Harmony.`);
        client.commands.set(command.name, command);
})

client.on("ready", () => console.log("Harmonic convergence is upon us!"));
client.login(process.env.CLIENT_TOKEN);

client.on("messageCreate", message => {
    if (!message.content.startsWith(config.prefix)) return;

    if(awaitingCommand) {
        
        const args = message.content.substring(config.prefix.length).split(/ +/);
        const command = client.commands.find(cmd => cmd.name == args[0]);
        if (!command) return console.log(`${args[0]} is not a supported command.`);
        awaitingCommand = false;
        
        try {
            command.run(message, args, client);
        } catch (error) {
            console.log()
        }

        awaitingCommand = true;
    }
    
})