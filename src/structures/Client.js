const Discord = require("discord.js");

const Command = require("./Command.js");

const HarmonicAudio = require("./HarmonicAudio.js")

const fs = require("fs");

const intents = new Discord.Intents(32767);

class Client extends Discord.Client {
    constructor(options) {
        super({intents});

        /**
         * @type {Discord.Collection<string, Command>}
         */
        this.commands = new Discord.Collection();

        this.audio = new HarmonicAudio();

    }

    start(token) {

        fs.readdirSync("./src/commands")
            .filter(file => file.endsWith(".js"))
            .forEach(file => {
                /**
                 * @type {Command}
                 */
                const command = require(`../commands/${file}`);
                console.log(`Command ${command.name} now in Harmony.`);
                this.commands.set(command.name, command);
            })

        this.login(token);
    }

}

module.exports = Client;