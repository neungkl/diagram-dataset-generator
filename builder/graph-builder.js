const random = require('../utils/random');
const AlphabetCounter = require('../utils/alphabet-counter');
const DecisionNode = require('./decision-node');
const SimpleNode = require('./simple-node');
const StartNode = require('./start-node');
const EndNode = require('./end-node');
const _ = require('lodash');

class GraphBuilder {
  constructor() {

  }

  createRandomNode(prob = 0.5) {
    if (random.rand() > prob) {
      return new SimpleNode();
    } else {
      return new DecisionNode();
    }
  }

  buildRandom(iterate = 8) {
    let Q = [];
    let simpleNodes = [];
    let graph = [];

    const probDesicion = 0.3;
    const probBack = 0.1;
    
    const startNode = new StartNode();
    Q.push(startNode);
    graph.push(startNode);

    for (let i = 0; i < iterate; i++) {
      while (true && Q.length > 0) {
        const frontNode = Q[0];
        if (frontNode instanceof SimpleNode) {
          if (frontNode.hasNext()) {
            Q.shift();
            continue;
          }
        } else if (frontNode instanceof DecisionNode) {
          if (frontNode.hasBothChild()) {
            Q.shift();
            continue;
          }
        }
        break;
      }

      const node = this.createRandomNode(probDesicion);
      let shouldAdd = true;

      if (Q.length > 0) {
        const frontNode = Q[0];
        if (frontNode instanceof SimpleNode) {
          if (random.rand() > probBack || simpleNodes.length == 0) {
            frontNode.setNext(node);
          } else {
            shouldAdd = false;
            frontNode.setNext(simpleNodes[random.randInt(simpleNodes.length)])
          }
        } else if (frontNode instanceof DecisionNode) {
          if (random.rand() > 0.5 || frontNode.hasRight()) {
            frontNode.setLeft(node);
          } else {
            frontNode.setRight(node);
          }
        }
      }

      if (shouldAdd) {
        Q.push(node);
        if (node instanceof SimpleNode) {
          simpleNodes.push(node)
        }
        graph.push(node);
      }
    }

    const endNode = new EndNode();
    while(Q.length > 0) {
      const frontNode = Q[0];
      if (frontNode instanceof SimpleNode) {
        if (!frontNode.hasNext()) {
          frontNode.setNext(endNode);
        }
      } else if(frontNode instanceof DecisionNode) {
        if (!frontNode.hasLeft()) {
          frontNode.setLeft(endNode);
        } else if(!frontNode.hasRight()) {
          frontNode.setRight(endNode);
        }
      }
      Q.shift();
    }
    graph.push(endNode);

    return graph;
  }
}

module.exports = GraphBuilder;