const voice = require('@discordjs/voice');
const { AudioQueue } = require('./Queue.js')

class AudioPlayer extends Voice.AudioPlayer {
    constructor(options){
        super(options);
        // The Audio Player has a queue for musics
        const queue = new AudioQueue();

        this.connection;
    }

    connectVoice(VoiceChannel,)

}