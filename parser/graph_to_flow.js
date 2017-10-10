const AlphabetCounter = require("../utils/alphabet-counter");
const StartNode = require('../graph/start-node');
const EndNode = require('../graph/end-node');
const SimpleNode = require('../graph/simple-node');
const DecisionNode = require('../graph/decision-node');
const random = require('../utils/random');

class GraphToFlow {
  constructor() {
    this.alphabetCounter = new AlphabetCounter()
  }
  convert(graph) {
    const ahbCounter = this.alphabetCounter;
    let text = [];
    ahbCounter.reset();

    for (let i = 0; i < graph.length; i++) {
      let label = "";

      if (i === 0) {
        label = "start"
      } else if (i === graph.length - 1) {
        label = "end"
      } else {
        label = graph[i].label || ahbCounter.next();
      }

      const g = graph[i];
      g.setLabel(label);

      if (g instanceof StartNode) {
        text.push(`st=>start: ${label}`);
      } else if (g instanceof EndNode) {
        text.push(`end=>end: ${label}`);
      } else if (g instanceof SimpleNode) {
        text.push(`${label}=>operation: ${label}`);
      } else if (g instanceof DecisionNode) {
        text.push(`${label}=>condition: ${label}`);
      }
    }

    text.push(`st->${graph[0].next.label}`)

    for (let i = 1; i < graph.length - 1; i++) {
      const g = graph[i];

      if (g instanceof SimpleNode) {
        if (g.hasNext()) {
          text.push(`${g.label}->${g.next.label}`);
        }
      } else if (g instanceof DecisionNode) {
        let direction = ["right", "left"];
        if (random.rand() > 0.5) {
          direction = ["left", "right"];
        }
        if (g.hasLeft()) {
          text.push(`${g.label}(yes, ${direction[0]})->${g.left.label}`);
        }
        if (g.hasRight()) {
          text.push(`${g.label}(no, ${direction[1]})->${g.right.label}`);
        }
      }
    }

    return text.join("\n");
  }
}

module.exports = new GraphToFlow();