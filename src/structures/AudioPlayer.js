const voice = require('@discordjs/voice');
const { AudioQueue } = require('./Queue.js')

class AudioPlayer extends Voice.AudioPlayer {
    constructor(options){
        super(options);
        // The Audio Player has a queue for musics
        this.queue = new AudioQueue();

        this.connection;
        this.subscription;
    }

    // For now, the audio player will only be responsible of
    // joining the channel. The subscription will be either the
    // client or the command responsibility.
    callVoice(voiceChannel){

        this.connection = voice.joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

    }

}