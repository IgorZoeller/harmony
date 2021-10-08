const Discord = require("discord.js")
const Client = require("./Client.js")

/**
 * 
 * @param {Discord.Message | Discord.Interaction} message 
 * @param {string[]} args 
 * @param {Client} client 
 */
function RunFunction(message, args, client) {}

/**
 * 
 * @param {Discord.Message | Discord.Interaction} message 
 * @param {string[]} args 
 * @param {Client} client 
 */
function RetrieveStatus(message, args, client) {}

class Command {
    /**
     * @typedef {{name: string, description: string, run: RunFunction, status: RetrieveStatus}} CommandOptions
     * @param {CommandOptions} options 
     */
    constructor(options) {
        this.name = options.name;
        this.description = options.description;
        this.run = options.run;
        this.status = options.status;
    }
}

module.exports = Command;