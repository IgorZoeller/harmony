const Discord = require("discord.js");

const Command = require("./Command.js");

const HarmonicAudio = require("./HarmonicAudio.js")

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
}

module.exports = Client;