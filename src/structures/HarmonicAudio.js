const { createAudioPlayer } = require('@discordjs/voice');

const AudioQueue = require('./Queue.js');

class HarmonicAudio {
    constructor(options){

        // The Audio Player has a queue for musics
        this.queue = new AudioQueue();

        this.player = createAudioPlayer();

    }

}

module.exports = HarmonicAudio;