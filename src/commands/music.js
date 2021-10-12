const Command = require("../structures/Command.js");

module.exports = new Command({
    name: "music",
    description: "Plays songs from youtube url's",
    run: argParser,
    status: retrieveStatus
})

function argParser(message, args, client) {

}

function retrieveStatus(message, args, client) {
    
}