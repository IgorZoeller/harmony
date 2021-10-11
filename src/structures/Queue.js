
class Queue {
    constructor(options) {

        this.items = {};
        this.headIndex = 0;
        this.tailIndex = 0;

    }

    enqueue(item) {

        this.items[this.tailIndex] = item;
        this.tailIndex++;

    }

    dequeue() {

        const item = this.items[this.headIndex];
        delete this.items[this.headIndex];
        this.headIndex++;
        return item;

    }

    peek() {
        
        return this.items[this.headIndex];

      }

      get length() {
        
        return this.tailIndex - this.headIndex;

      }

      get isEmpty() {

        return this.headIndex == this.tailIndex;

      }
}

module.exports = Queue;

class AudioQueue extends Queue {
    constructor(options) {
        super(options);
    }

    shuffle(){

        // Durstenfeld shuffle algorithm.
        for (let i = this.item.length - 1; i > this.headIndex; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            [this.item[i], this.item[j]] = [this.item[j], this.item[i]];
        }

    }

}

module.exports = AudioQueue;