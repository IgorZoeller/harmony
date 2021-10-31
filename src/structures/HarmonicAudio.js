const { createAudioPlayer, joinVoiceChannel, getVoiceConnection, PlayerSubscription, AudioPlayerStatus, entersState, demuxProbe, createAudioResource, AudioResource } = require("@discordjs/voice");
const EventEmitter = require('events');
const Queue = require("./Queue.js")
const Discord = require("discord.js");
const fs = require("fs");

const AudioQueueStatus = {
    Empty: "empty",
    Ready: "ready"
}

class AudioQueue extends Queue {
    constructor(options) {
        super(options);

        this.QueueStatus = new EventEmitter();

        // Initialize queue at state zero.
        this.status = AudioQueueStatus.Empty;
        this.currentTrack = null;

    }

    shuffle(){
        console.log("Will shuffle queue.");
        // Durstenfeld shuffle algorithm.
        // The +1 to the headIndex is a TEMPORARY fix. TO-DO: when the resource
        // is not playable, either because of an error or because it was already
        // played before, recreate the Audio Resource and try again.
        for (let i = this.headIndex + (this.length - 1); i > this.headIndex + 1; i--) {
            let j = Math.floor(Math.random() * (i + 1))
            [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
        }
    }

    enqueue(item) {
        console.log("Increasing queue.");
        super.enqueue(item);
        const queueLength = this.length + (!(this.currentTrack == null));
        console.log(`${queueLength} itens in queue.`);
        if (queueLength == 1) {
            this.QueueStatus.emit(AudioQueueStatus.Ready);
            this.status = AudioQueueStatus.Ready;
        }
        return queueLength;
    }

    pop() {
        this.currentTrack = super.peek();
        console.log("Popped item out of queue.");
        super.dequeue();
        console.log(`${this.length} itens in queue and ${0+(!(this.currentTrack == null))} being attended to.`);
        if (this.isEmpty) {
            this.QueueStatus.emit(AudioQueueStatus.Empty);
            this.status = AudioQueueStatus.Empty;
        }
        return this.currentTrack;
    }

    /**
     * @param {string} newStatus 
     */
    set status(newStatus) {
        if (newStatus != this.status) {
            console.log(`Queue changed to ${newStatus} status.`);
            this.QueueStatus.emit("stateChange", newStatus);
        }
    }
}

/**
 * @todo When the resource is not playable, either because of an error or because it was already played before, recreate the Audio Resource and try again.
 * @todo Remake State machine, but now based on AudioQueueStatus
 */
class HarmonicAudio {
    constructor(options){

        // The Audio Player has a queue for musics
        this.queue = new AudioQueue();
        console.log("Initialized Queue");

        this.player = createAudioPlayer();
        console.log("Initialized Audio Player");

        /**
         * @type {Discord.Collection<string, PlayerSubscription>}
         */
        this.subscriptions = new Discord.Collection();
        console.log("Initialized Subscriptions Collection");

        // Harmonic Audio State Machine:

        // Monitors the Queue Status to start the State Machine
        // Whenever the queue has at least one item on it, it is at Ready status
        // and the Audio Player should start playing right away.
        this.queue.QueueStatus.on("stateChange", async (newStatus) => {
            if (newStatus == AudioQueueStatus.Ready && this.queue.currentTrack == null) {
                console.log("Going to start playing through the queue.");
                const currentResource = this.queue.pop();
                await this.play(currentResource);
            }
        });

        // Whenever the Audio Player returns to Idle status, check if there is any resource for it to play.
        this.player.on(AudioPlayerStatus.Idle, async () => {
            console.log("Audio Player on Idle status.");
            if (this.queue.isEmpty == false) {
                console.log("Audio queue is not empty.\nWill attempt to play resource");
                const currentResource = this.queue.pop();     
                await this.play(currentResource)
            } else {
                console.log("Queue is empty. Will wait for new resource to play.")
                this.queue.currentTrack = null;
            }
        });

        // An AudioPlayer will always emit an "error" event with a .resource property
        this.player.on('error', error => {
            console.error('Error:', error.message, 'with track', error.resource.metadata.title);
            this.queue.currentTrack = null;
            //this.logError(error, "HarmonicAudioError.log")
        });

        // End of State Machine.

    }

    async play(resource) {
        this.player.play(resource);
        try {
            await entersState(this.player, AudioPlayerStatus.Playing, 5_000);
            // The player has entered the Playing state within 5 seconds
            console.log(`Now playing ${resource.metadata.title}`);
        } catch (error) {
            // The player has not entered the Playing state and either:
            // 1) The 'error' event has been emitted and should be handled
            // 2) 5 seconds have passed
            console.error(error);
        }
    }

    async probeAndCreateResource(readableStream, optionalData) {
        const { stream, type } = await demuxProbe(readableStream);
        // Debug
        console.log(`Probing detected type: ${type}`);
        return createAudioResource(stream, {metadata: { inputType: type, ...optionalData }});
    }

    /**
     * 
     * @param {Discord.VoiceChannel | Discord.StageChannel} channel 
     */
    connect(channel) {

        joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

    }

    /**
     * 
     * @param {Discord.VoiceChannel | Discord.StageChannel} channel 
     */
    subscribe(channel) {

        const connection = getVoiceConnection(channel.guild.id);
        const subscription = connection.subscribe(this.player);

        // Stores at the collection the channel guild id to facilitate
        // handling subscriptions/connections in future parts of the code
        this.subscriptions.set(channel.guild.id, subscription);
        console.log(`Subscribed player at ${channel.guild.id}.`);

    }

    isConnected(channel) {
        const channelGuildId = channel.guild.id;
        const subscription = this.subscriptions.get(channelGuildId);
        const connection = getVoiceConnection(channelGuildId);

        if (subscription && connection) {
            return true;
        } else {
            return false;
        }
    }

    clearAllConnections() {

        let keys = Array.from(this.subscriptions.keys())

        keys.forEach(key => {
            this.clearConnection(key);
        });

        delete this.subscriptions;
        this.subscriptions = new Discord.Collection();

    }

    /**
     * 
     * @param {string} channelGuildId 
     */
    clearConnection(channelGuildId) {
        const subscription = this.subscriptions.get(channelGuildId);
        const connection = getVoiceConnection(channelGuildId);

        console.log(`Clearing player at ${channelGuildId}.`);

        if (subscription) {
            subscription.unsubscribe();
            connection.disconnect();
        }
    }

    /**
     * 
     * @param {AudioResource} resource
     * @param {string} errorFile
     */
    logError(error, errorFile) {
        const error_time = new Date().toString();
        console.log(error_time);
        console.log(error);
        console.log(error.resource);
        let errorFileWS = fs.createWriteStream(errorFile, { flags: "a" });
        errorFileWS.write(error_time + "\n");
        errorFileWS.write("edges 0 type: " + JSON.stringify(error.resource.edges[0].type) + "\n");
        errorFileWS.write("edges 1 type: " + JSON.stringify(error.resource.edges[1].type) + "\n");
        errorFileWS.write("metadata: "     + JSON.stringify(error.resource.metadata, null, 2) + "\n");
        errorFileWS.end();
    }

}

module.exports = HarmonicAudio;