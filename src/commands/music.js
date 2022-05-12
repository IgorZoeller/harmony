const Command = require("../structures/Command.js");
const fs = require("fs");
const ytdl = require("ytdl-core")
const { AudioResource, AudioPlayerStatus, StreamType } = require("@discordjs/voice");

module.exports = new Command({
    name: "music",
    description: "Plays songs",
    run: run,
    status: null
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

const options = {

    test: {
        description: "test",
        method: function(message, complements, client) {

        }
    },
    
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
        method: async (message, complements, client) => {
        
            const channel = message.member.voice.channel;
    
            // First, checks wheter Harmonic Audio is connected to
            // the current channel. If not, connects to it.
            if (client.audio.isConnected(channel) == false) {
                const connect = options["connect"].method;
                connect(message, complements, client);
            }

            const yt_url = complements[0];
            let song;
            let optionalData;
            if ( ytdl.validateURL(yt_url) ) {
                try {
                    const videoID = ytdl.getURLVideoID(yt_url);
                    const basicInfo = await ytdl.getBasicInfo(yt_url);
                    optionalData = {title: basicInfo.videoDetails.title};
                    // Filtering the formats to audio only.
                    const info = await ytdl.getInfo(videoID);
                    let audioFormats = ytdl.filterFormats(info.formats, 'audioonly')
                    let format = ytdl.chooseFormat(audioFormats, { quality: "highestaudio" });

                    
                    song = ytdl(yt_url, {
                            format,
                            highWaterMark: 1<<25
                        });
                } catch(err) {
                    console.error(err);
                }

            } else {
                return message.reply("Invalid URL. Please try again.")
            }

            const new_resource = await client.audio.probeAndCreateResource(song, optionalData);

            const queueLength = client.audio.queue.enqueue(new_resource);
            message.reply(`${queueLength} items in queue.`);

        }
    },


    queue: {
        description: "Shows all titles in the queue.",
        method: function(message, complements, client) {

            if (client.audio.queue.isEmpty) {
                return message.reply("Queue is empty.");
            }
            const current = client.audio.queue.currentTrack.metadata.title;
            let messageBody = "> " + current + "\n";

            for (let i = 0; i < client.audio.queue.length; i++) {
                const item = client.audio.queue.peek(i).metadata.title;
                messageBody = messageBody + (item + "\n");
            }

            let queueMessage = ["\`\`\`", messageBody, "\`\`\`"].join("");

            message.reply(queueMessage);

        }
    },


    pause: {
        description: "Pauses the currently active Queue",
        method: function(message, complements, client) {
            client.audio.player.pause();
            debugMessage = "Queue paused."
            message.reply(debugMessage);
            console.log(debugMessage);            
        }
    },

    resume: {
        description: "Resumes the currently active Queue",
        method: function(message, complements, client) {
            client.audio.player.unpause();
            debugMessage = "Queue resumed."
            message.reply(debugMessage);
            console.log(debugMessage);
        }
    },


    skip: {
        description: "Skips to the next audio resource in Queue",
        method: function(message, complements, client) {
            const songsToSkip = int(complements[0]) ?? 1;
            let debugMessage;

            if (songsToSkip == 1) {
                debugMessage = `Skipping the next song.`;
            } else if (songsToSkip > 1) {
                debugMessage = `Skipping the next ${songsToSkip} songs.`;
            }

            message.reply(debugMessage);
            console.log(debugMessage);
            for (let i = 0; i < songsToSkip; i++) {
                client.audio.queue.dequeue();
            }

            client.audio.player.pause();
            client.audio.player.emit(AudioPlayerStatus.Idle);
        }
    },


    shuffle: {
        description: "Shuffles the Queue",
        method: async (message, complements, client) => {
            client.audio.queue.shuffle();
            const showQueue = options["queue"].method;
            showQueue(message, complements, client);
        }
    },


    clear: {
        description: "Clears all audio resources at the Queue",
        method: function(message, complements, client) {
            client.audio.queue.clear();
        }
    },


    disconnect: {
        description: "Disconnects from the user current voice channel.",
        method: function(message, complements, client) {
            const channel = message.member.voice.channel;

            if (client.audio.isConnected(channel)) {
                client.audio.clearConnection(channel.guild.id);
                client.audio.queue.clear();
            } else {
                console.log(`Attempted to disconnect from channel ${channel.guild.id} but I wasn't connected in the first place.`)
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