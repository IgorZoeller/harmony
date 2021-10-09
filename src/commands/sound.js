const Command = require("../structures/Command.js");
const path = require("path");
const { joinVoiceChannel , VoiceConnectionStatus, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

const root = path.dirname(require.main.filename);
console.log(root);
const fs = require("fs");

const sound_assets = [];
fs.readdirSync("./src/assets").forEach(asset => {
    const asset_path = path.join(root, `./assets/${asset}`);
    sound_assets.push(asset_path);
    console.log(`Loaded ${asset_path} sound asset.`);
})

const player = createAudioPlayer();

module.exports = new Command({
    name: "sound",
    description: "Plays a short sound effect.",
    run: playSound,
    status: playSound 
})

async function playSound(message, args, client) {
    
    const sounds = [];
    sound_assets.forEach(asset => {
        if (path.basename(asset).startsWith(args[1])) {
            sounds.push(asset);
        }
    })
    
    const random_pick = sounds[Math.floor(Math.random()*sounds.length)]

    const channel = message.member.voice.channel;

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    const subscription = connection.subscribe(player);

    connection.on(VoiceConnectionStatus.Ready, () => {
        console.log(`The connection has entered the Ready state - ready to play ${random_pick}`);

        const debug_path = (random_pick);
        console.log(debug_path);
        const resource = createAudioResource(debug_path);

        player.play(resource);
        player.on("error", error => {
            console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
        });
        player.on(AudioPlayerStatus.Playing, () => {
            console.log("Audio should be playing");
        })

        player.on(AudioPlayerStatus.Idle, () => {
            console.log("Audio player not playing.")
            if (subscription) {
                subscription.unsubscribe();
                connection.disconnect();
            }
        })
    
    });

}