console.clear();

require("dotenv").config();
const Client  = require("./structures/Client.js");
const Command = require("./structures/Command.js");

const config = require("./config/config.json");

const client = new Client();
client.start(process.env.CLIENT_TOKEN)

let awaitingCommand = true;

client.on("ready", () => console.log("Harmonic convergence is upon us!"));

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