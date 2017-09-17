class AlphabetCounter {
  constructor() {
    this.reset();
  }

  next() {
    let id = this.index;
    let text = "";
    const a = 'a'.charCodeAt(0);

    while(id >= 0) {
      text = String.fromCharCode(a + (id % 26)) + text;
      id = Math.floor(id / 26) - 1;
    }

    this.index += 1;
    return text;
  }

  reset() {
    this.index = 0;
  }
}

module.exports = AlphabetCounter;