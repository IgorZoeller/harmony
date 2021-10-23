const Command = require("../structures/Command.js");
const { createAudioResource, AudioPlayerStatus, entersState } = require("@discordjs/voice");

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
        async: false,
        description: "Connects to the user current voice channel.",
        method: function(message, complements, client) {
        
            const channel = message.member.voice.channel;

            client.audio.connect(channel);
            client.audio.subscribe(channel);
    
        }
    },


    play: {
        async: true,
        description: "Plays the audio requested.",
        method: async (message, complements, client) => {
        
            const channel = message.member.voice.channel;
    
            // First, checks wheter Harmonic Audio is connected to
            // the current channel. If not, connects to it.
            if (client.audio.isConnected(channel) == false) {
                const connect = options["connect"].method;
                connect(message, complements, client);
            }

            let resName = "C:\\PersonalProjects\\harmony\\src\\assets\\chatuba-treasure.mp3";

            const new_resource = createAudioResource(resName, {
                metadata: {
                    title: `${resName}`
                }
            });

            client.audio.queue.enqueue(new_resource);
            message.reply(`${client.audio.queue.length} items in queue.`)

            if (client.audio.queue.isEmpty) {
                let current_resource = client.audio.queue.peek();
                client.audio.player.play(current_resource);
            } 

            client.audio.player.on(AudioPlayerStatus.Idle, (resource = client.audio.queue.peek() ?? null) => {
                if (resource != null) {
                    client.audio.player.play(resource);
                }
            })

        }
    },

    queue: {
        async: false,
        description: "Shows all titles in the queue.",
        method: function(message, complements, client) {

            msgBody = ""
            client.audio.queue.forEach(item => {
                msgBody = msgBody + `${item.metadata.title}\n`;
            });

            message.reply(msgBody);

        }
    },


    pause: {
        async: false,
        description: "Pauses the currently active Queue",
        method: function(message, complements, client) {}
    },

    resume: {
        async: false,
        description: "Resumes the currently active Queue",
        method: function(message, complements, client) {}
    },


    skip: {
        async: false,
        description: "Skips to the next audio resource in Queue",
        method: function(message, complements, client) {}
    },


    shuffle: {
        async: false,
        description: "Shuffles the Queue",
        method: function(message, complements, client) {}
    },


    clear: {
        async: false,
        description: "Clears all audio resources at the Queue",
        method: function(message, complements, client) {}
    },


    disconnect: {
        async: false,
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
        async: false,
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