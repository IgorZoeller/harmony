const Command = require("../structures/Command.js");

module.exports = new Command({
    name: "github",
    description: "URL to Harmony's GitHub repository.",
    run: run,
    status: run
})

async function run(message, args, client) {

    message.reply("https://github.com/IgorZoeller/harmony#readme");

}
