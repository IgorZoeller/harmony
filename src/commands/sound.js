const Command = require("../structures/Command.js");
const path = require("path");
const { joinVoiceChannel, VoiceConnectionStatus, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

const root = path.dirname(require.main.filename);
const fs = require("fs");

const sound_assets = [];
fs.readdirSync("./src/assets").forEach(asset => {
    const asset_path = path.join(root, `./assets/${asset}`);
    sound_assets.push(asset_path);
    console.log(`Loaded ${asset_path} sound asset.`);
})

module.exports = new Command({
    name: "sound",
    description: "Plays a short sound effect.",
    run: playSound,
    status: playSound 
})

async function playSound(message, args, client) {
    
    var sounds = [];
    if (args[1]) {
        sound_assets.forEach(asset => {
            if (path.basename(asset).startsWith(args[1])) {
                sounds.push(asset);
            }
        })
    } else {
        sounds = sound_assets;
    }

    if (sounds.length == 0) {
        return message.reply(`No sound effects corresponding to \"${args[1]}\"`);
    }
    
    const random_pick = sounds[Math.floor(Math.random()*sounds.length)]

    const channel = message.member.voice.channel;

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    const subscription = connection.subscribe(client.audio.player);

    connection.once(VoiceConnectionStatus.Ready, () => {
        console.log(`Playing sound effect ${path.basename(random_pick)}`);

        const resource = createAudioResource(random_pick);

        client.audio.player.play(resource);
        client.audio.player.on("error", error => {
            console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
        });

        client.audio.player.once(AudioPlayerStatus.Idle, () => {
            if (subscription) {
                subscription.unsubscribe();
                connection.disconnect();
            }
        })
    
    });

}