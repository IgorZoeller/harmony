const { createAudioPlayer, joinVoiceChannel, getVoiceConnection, PlayerSubscription, AudioPlayerStatus, entersState } = require("@discordjs/voice");

const Discord = require("discord.js")

class AudioQueue extends Queue {
    constructor(options) {
        super(options);
    }

    shuffle(){

        // Durstenfeld shuffle algorithm.
        for (let i = this.item.length - 1; i > this.headIndex; i--) {
            let j = Math.floor(Math.random() * (i + 1))
            [this.item[i], this.item[j]] = [this.item[j], this.item[i]];
        }

    }

    enqueue(item) {
        super.enqueue(item);
        // 
    }

}

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

}

module.exports = HarmonicAudio;