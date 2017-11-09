const AlphabetCounter = require("../utils/alphabet-counter");
const StartNode = require('../graph/start-node');
const EndNode = require('../graph/end-node');
const SimpleNode = require('../graph/simple-node');
const DecisionNode = require('../graph/decision-node');
const random = require('../utils/random');
const _ = require('lodash');

class GraphToFlow {
  constructor() {
    this.alphabetCounter = new AlphabetCounter()
  }
  convert(inputGraph) {
    // const ahbCounter = this.alphabetCounter;
    const graph = _.cloneDeep(inputGraph);
    let text = [];
    let decisionNodeCount = 1;
    let statementNodeCount = 1;
    // ahbCounter.reset();

    for (let i = 0; i < graph.length; i++) {
      graph[i]._id = i;
    }

    for (let i = 0; i < graph.length; i++) {
      let label = "";

      if (i === 0) {
        label = "start"
      } else if (i === graph.length - 1) {
        label = "end"
      } else {
        if (graph[i] instanceof SimpleNode) {
          label = 'st' + statementNodeCount++;
        } else {
          label = 'dcs' + decisionNodeCount++;
        }
        // label = ahbCounter.next();
      }

      const g = graph[i];
      const blockDesciption = graph[i].label || label;

      if (g instanceof StartNode) {
        text.push(`st=>start: ${label}`);
      } else if (g instanceof EndNode) {
        text.push(`end=>end: ${label}`);
      } else if (g instanceof SimpleNode) {
        text.push(`${label}=>operation: ${blockDesciption}`);
      } else if (g instanceof DecisionNode) {
        text.push(`${label}=>condition: ${blockDesciption}`);
      }

      g.setLabel(label);
    }

    text.push(`st->${graph[0].next.label}`)

    for (let i = 1; i < graph.length - 1; i++) {
      const g = graph[i];
      let hasDrawn = false;

      if (g instanceof SimpleNode) {
        if (i < graph.length - 2) {
          if (graph[i - 1] instanceof DecisionNode && graph[i + 1] instanceof DecisionNode) {
            text.push(`${g.label}(right)->${g.next.label}`);
            hasDrawn = true;
          }
        }
        if (!hasDrawn && g.hasNext()) {
          if (g._id < g.next._id) {
            if (random.rand() > 0.75) {
              text.push(`${g.label}->${g.next.label}`);
            } else {
              text.push(`${g.label}(right)->${g.next.label}`);
            }
          } else {
            if (random.rand() > 0.5) {
              text.push(`${g.label}(left)->${g.next.label}`);
            } else {
              text.push(`${g.label}(right)->${g.next.label}`);
            }
          }
        }
      } else if (g instanceof DecisionNode) {
        if (g.hasLeft()) {
          if (random.rand() > 1) {
            text.push(`${g.label}(yes, right)->${g.left.label}`);
          } else {
            text.push(`${g.label}(yes, bottom)->${g.left.label}`);
          }
        }
        if (g.hasRight()) {
          text.push(`${g.label}(no)->${g.right.label}`);
        }
      }
    }

    return text.join("\n");
  }
}

module.exports = new GraphToFlow();