const Node = require('./node')

class DecisionNode extends Node {
  constructor(opts) {
    super();
    if (typeof opts === 'string') {
      this.label = opts;
    } else if (typeof opts === 'object') {
      if(typeof opts.label === 'string') this.label = opts.label;
      this.left = opts.left || null;
      this.right = opts.right || null;
    }
  }

  setLeft(left) {
    this.left = left;
  }

  setRight(right) {
    this.right = right;
  }

  hasNode(node) {
    if (this.hasLeft()) {
      if (this.left.label === node.label) return true;
    } else if (this.hasRight()) {
      if (this.right.label === node.label) return true;
    }
    return false;
  }

  hasChild() {
    return this.hasLeft() || this.hasRight();
  }

  hasBothChild() {
    return this.hasLeft() && this.hasRight();
  }

  hasLeft() {
    return this.left != null;
  }

  hasRight() {
    return this.right != null;
  }
}

module.exports = DecisionNode;