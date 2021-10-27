const { createAudioPlayer, joinVoiceChannel, getVoiceConnection, PlayerSubscription, AudioPlayerStatus, entersState, demuxProbe, createAudioResource } = require("@discordjs/voice");
const EventEmitter = require('events');
const Queue = require("./Queue.js")
const Discord = require("discord.js")

class AudioQueue extends Queue {
    constructor(options) {
        super(options);

        this.QueueStatus = new EventEmitter();
        this.status = "Empty";
    }

    shuffle(){

        console.log("Will shuffle queue.");
        console.log(this.headIndex + (this.length - 1));
        console.log(this.headIndex)
        // Durstenfeld shuffle algorithm.
        // The +1 to the headIndex is a TEMPORARY fix. TO-DO: when the resource
        // is not playable, either because of an error or because it was already
        // played before, recreate the Audio Resource and try again.
        for (let i = this.headIndex + (this.length - 1); i > this.headIndex + 1; i--) {
            console.log(i);
            console.log(this.headIndex);
            let j = Math.floor(Math.random() * (i + 1))
            console.log(j)
            console.log(this.items[i].metadata.title);
            console.log(this.items[j].metadata.title);
            [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
        }

    }

    enqueue(item) {
        console.log("Adding to queue.")
        super.enqueue(item);
        console.log(`${this.length} itens in queue.`)
        if (this.length == 1) {
            const newStatus = "Ready";
            this.QueueStatus.emit(newStatus);
            this.status = newStatus;
        }
    }

    dequeue() {
        super.dequeue();
        console.log(`${this.length} itens in queue.`)
        if (this.isEmpty) {
            super.clear();
            const newStatus = "Empty";
            this.QueueStatus.emit(newStatus);
            this.status = newStatus;
        }
    }

    /**
     * @param {string} newStatus 
     */
    set status(newStatus) {
        if (newStatus != this.status) {
            console.log(`Queue changed to ${newStatus} status.`);
            this.QueueStatus.emit("changeStatus", this.status, newStatus);
        }
    }

}

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
        // Whenever the queue has at least one item on it, it is in Ready status
        // and the Audio Player should start playing right away.
        this.queue.QueueStatus.on("changeStatus", (oldStatus, newStatus) => {
            if (newStatus == "Ready" && this.player.state != AudioPlayerStatus.Playing) {
                console.log("Going to start playing through the queue.");
                this.player.emit(AudioPlayerStatus.Idle);
            }
        });

        // Whenever the Audio Player leaves Playing status, decrease the queue and return to Idle status.
        // It is important to dequeue only now (after the resource finished playing) to avoid emptying
        // the queue at the wrong time when there is only one item on it.
        this.player.on("stateChange", (oldState, newState) => {
            if (oldState.status == AudioPlayerStatus.Playing && newState.status == AudioPlayerStatus.Idle) {
                console.log("Resource ended. Now decreasing queue.")
                this.queue.dequeue();
            }
        });
        
        // Whenever the Audio Player returns to Idle status, check if there is any resource for it to play.
        this.player.on(AudioPlayerStatus.Idle, async () => {
            console.log("Audio Player on Idle status.");

            if (this.queue.isEmpty == false) {
                const currentResource = this.queue.peek();
                console.log("Audio queue is not empty.\nWill attempt to play resource");

                // TO-DO: when the resource is not playable, either because of 
                // an error or because it was already played before, recreate the
                // Audio Resource and try again.
                this.player.play(currentResource);
                try {
                    await entersState(this.player, AudioPlayerStatus.Playing, 5_000);
                    // The player has entered the Playing state within 5 seconds
                    console.log(`Now playing ${currentResource.metadata.title}`);
                } catch (error) {
                    // The player has not entered the Playing state and either:
                    // 1) The 'error' event has been emitted and should be handled
                    // 2) 5 seconds have passed
                    console.error(error);
                }
            } else {
                console.log("Queue is empty. Will wait for new resource to play.")
            }
        });

        // An AudioPlayer will always emit an "error" event with a .resource property
        this.player.on('error', error => {
            console.error('Error:', error.message, 'with track', error.resource.metadata.title);
        });

    }

    async probeAndCreateResource(readableStream, optionalData) {
        const { stream, type } = await demuxProbe(readableStream);
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

}

module.exports = HarmonicAudio;