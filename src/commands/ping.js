const Command = require("../structures/Command.js");

module.exports = new Command({
    name: "ping",
    description: "Shows bot latency in ms.",
    run: getPing,
    status: getPing
})

async function getPing(message, args, client) {

    const msg = await message.reply(`Ping: ${client.ws.ping} ms.`)

    //msg.edit(`Ping: ${client.ws.ping} ms.\nMessage Ping ${msg.createdTimestamp - message.createdTimestamp} ms.`)

}