const Node = require('./node')

class SimpleNode extends Node {
  constructor(opts) {
    super(opts);
    if (typeof opts === 'string') {
      this.label = opts;
    } else if (typeof opts === 'object') {
      if(typeof opts.label === 'string') this.label = opts.label;
      this.next = opts.next || null;
    }
  }

  setNext(next) {
    this.next = next;
  }

  hasNext() {
    return this.next != null;
  }
}

module.exports = SimpleNode;