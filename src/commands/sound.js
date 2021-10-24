const Command = require("../structures/Command.js");
const path = require("path");
const { createAudioResource, AudioPlayerStatus, entersState } = require("@discordjs/voice");

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
    run: run,
    status: run 
})

async function run(message, args, client) {
    
    // The Music command has priority on the Sound command
    // and, on top of that, we don't want to flood the audio
    // queue with multiple Sound calls. We fix that by doing
    // a small check on the audio queue size before running.
    if (client.audio.queue.isEmpty == false) {
        const queueSize = client.audio.queue.length
        if (queueSize > 1) {
            return message.reply(`Harmonic Audio already has ${queueSize} items on queue!\nWait for it to end or close the queue to play sound effects.`)
        }
        return message.reply("Harmonic Audio already has one item on queue!\nWait for it to end or close the queue to play sound effects.")
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
            title: `${path.basename(random_pick)}`,
            type: "SoundEffect"
        }
    });

    client.audio.queue.enqueue(resource);

    client.audio.player.play(client.audio.queue.peek())

    try {
        await entersState(client.audio.player, AudioPlayerStatus.Playing, 5_000);
        // The player has entered the Playing state within 5 seconds
        console.log(`Now playing ${resource.metadata.title}`);
    } catch (error) {
        // The player has not entered the Playing state and either:
        // 1) The 'error' event has been emitted and should be handled
        // 2) 5 seconds have passed
        console.error(error);
    }

    client.audio.player.once(AudioPlayerStatus.Idle, () => {
        client.audio.queue.dequeue();
        client.audio.clearConnection(channel.guild.id);
    })

}