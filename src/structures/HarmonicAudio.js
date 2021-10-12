const { createAudioPlayer, joinVoiceChannel, getVoiceConnection, PlayerSubscription, AudioPlayerStatus, entersState } = require('@discordjs/voice');

const Discord = require("discord.js")

const AudioQueue = require('./Queue.js');

class HarmonicAudio {
    constructor(options){

        // The Audio Player has a queue for musics
        this.queue = new AudioQueue();

        this.player = createAudioPlayer();

        /**
         * @type {Discord.Collection<string, PlayerSubscription>}
         */
        this.subscriptions = new Discord.Collection();

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

    async startPlaying(resource) {
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

}

module.exports = HarmonicAudio;