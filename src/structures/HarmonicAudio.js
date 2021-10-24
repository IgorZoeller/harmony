const { createAudioPlayer, joinVoiceChannel, getVoiceConnection, PlayerSubscription, AudioPlayerStatus, entersState } = require("@discordjs/voice");
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

        // Durstenfeld shuffle algorithm.
        for (let i = this.item.length - 1; i > this.headIndex; i--) {
            let j = Math.floor(Math.random() * (i + 1))
            [this.item[i], this.item[j]] = [this.item[j], this.item[i]];
        }

    }

    enqueue(item) {
        console.log("Adding to queue.")
        super.enqueue(item);
        if (this.length == 1) {
            const newStatus = "Ready";
            this.QueueStatus.emit(newStatus);
            this.status = newStatus;
        }
    }

    dequeue() {
        super.dequeue();
        if (this.isEmpty) {
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


        this.queue.QueueStatus.on("changeStatus", (oldStatus, newStatus) => {
            if (newStatus == "Ready" && this.player.state != AudioPlayerStatus.Playing) {
                console.log("Going to start playing through the queue.");
                this.player.emit(AudioPlayerStatus.Idle);
            }
        });
        this.player.on("stateChange", (oldState, newState) => {
            if (oldState.status == AudioPlayerStatus.Playing && newState.status == AudioPlayerStatus.Idle) {
                console.log("Resource ended. Now decreasing queue.")
                this.queue.dequeue();
            }
        });
        // Harmonic Audio starts at the Idle State.
        // It also takes actions only when in this State.
        this.player.on(AudioPlayerStatus.Idle, async () => {
            console.log("Audio Player on Idle status.");

            if (this.queue.isEmpty == false) {
                const currentResource = this.queue.peek();
                console.log("Audio queue is not empty.\nWill attempt to play resource");
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