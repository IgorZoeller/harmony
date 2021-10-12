const { createAudioPlayer, joinVoiceChannel, getVoiceConnection, PlayerSubscription, getVoiceConnections} = require('@discordjs/voice');

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

    async connect(channel) {

        joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

    }

    async subscribe(channel) {

        const connection = getVoiceConnection(channel.guild.id)
        const subscription = connection.subscribe()
        this.subscriptions.set(channel.guild.id, subscription)

    }

    clearAllConnections() {

        this.subscriptions.keys.forEach(key => {

            this.clearConnection(key);

        })

        delete this.subscriptions;
        this.subscriptions = new Discord.Collection();

    }

    clearConnection(channel) {
        const subscription = this.subscriptions.get(channel);
        const connection = getVoiceConnection(channel);

        subscription.unsubscribe();
        connection.disconnect;
    }

}

module.exports = HarmonicAudio;