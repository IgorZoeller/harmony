const Command = require("../structures/Command.js");
const path = require("path");
const { createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

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
    
    // The Music command has priority on the Sound command
    // and, on top of that, we don't want to flood the audio
    // queue with multiple Sound calls. We fix that by doing
    // a small check on the audio queue size before running.
    if (client.audio.queue.isEmpty == false) {
        const queueSize = client.audio.queue.length
        if (queueSize > 1) {
            return message.reply(`Harmonic Audio already has ${queueSize} items on queue!\nWait for it to end or close the queue to play sound effects.`)
        }
        return message.reply(`Harmonic Audio already has one item on queue!\nWait for it to end or close the queue to play sound effects.`)
    }

    let sounds = [];
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

    client.audio.connect(channel);
    client.audio.subscribe(channel);

    const resource = createAudioResource(random_pick, {
        metadata: {
            title: `${path.basename(random_pick)}`
        }
    });

    client.audio.queue.enqueue(resource);

    await client.audio.startPlaying();
    
    client.audio.player.once("error", error => {
        console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
    });

    client.audio.player.once(AudioPlayerStatus.Idle, () => {
        client.audio.queue.dequeue();
        client.audio.clearConnection(channel.guild.id);
    })

}