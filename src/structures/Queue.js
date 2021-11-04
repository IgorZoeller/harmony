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
        delete this.items[this.headIndex];
        this.headIndex++;
        if (this.isEmpty) {
          this.clear();
        }
    }

    /**
     * Clears the Queue
     */
    clear() {
        this.items = {};
        this.headIndex = 0;
        this.tailIndex = 0;
    }

    peek(i = 0) {  
        return this.items[this.headIndex + i];
      }

      get length() {
        return this.tailIndex - this.headIndex;
      }

      get isEmpty() {
        return this.headIndex == this.tailIndex;
      }

}

module.exports = Queue;