const Command = require("../structures/Command.js");

module.exports = new Command({
    name: "music",
    description: "Plays songs",
    run: run,
    status: retrieveStatus
})

function run(message, args, client) {

    const selector = args[1] ?? "connect";

    if (Object.keys(options).includes(selector) == false) {
        return message.reply("Selected option not found. Type \`!music help\` to see all possible options.");
    }

    let option = options[selector].method;
    
    const complements = args.slice(2, args.length);
    option(message, complements, client);

}

function retrieveStatus(message, args, client) {

    let run = options["help"].method;

    run(message, args, client);
    
}

const options = {

    connect: {
        description: "Connects to the user current voice channel.",
        method: function(message, complements, client) {
        
            const channel = message.member.voice.channel;

            client.audio.connect(channel);
            client.audio.subscribe(channel);
    
        }
    },


    play: {
        description: "Plays the audio requested.",
        method: function(message, complements, client) {
        
            const channel = message.member.voice.channel;
    
            // First, checks wheter Harmonic Audio is connected to
            // the current channel. If not, connects to it.
            if (client.audio.isConnected(channel) == false) {
                const connect = options["connect"].method;
                connect(message, complements, client);
            };

            const resource = createAudioResource(complements[0], {
                metadata: {
                    title: `${path.basename(random_pick)}`
                }
            });

            client.audio.queue.enqueue()

        }
    },


    pause: {
        description: "Pauses the currently active Queue",
        method: function(message, complements, client) {}
    },


    skip: {
        description: "Skips to the next audio resource in Queue",
        method: function(message, complements, client) {}
    },


    shuffle: {
        description: "Shuffles the Queue",
        method: function(message, complements, client) {}
    },


    clear: {
        description: "Clears all audio resources at the Queue",
        method: function(message, complements, client) {}
    },


    disconnect: {
        description: "Disconnects from the user current voice channel.",
        method: function(message, complements, client) {
            const channel = message.member.voice.channel;

            if (client.audio.isConnected(channel)) {
                client.audio.clearConnection(channel.guild.id);
            } else {
                console.log(`Attempted to disconnect from channel ${channel.guild.id} but wasn't connected in the first place.`)
            }
        }
    },


    help: {
        description: "Shows this message.",
        method: function(message, complements, client) {

            let messageBody = "";

            Object.keys(options).forEach(option => {

                messageBody = messageBody + (option + ": " + options[option].description + "\n");
            })

            let helpMessage = ["\`\`\`", messageBody, "\`\`\`"].join("");

            message.reply(helpMessage);

        }
    }

}