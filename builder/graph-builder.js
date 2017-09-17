const Node = require('./node');
const random = require('../utils/random');
const AlphabetCounter = require('../utils/alphabet-counter');
const _ = require('lodash');

class GraphBuilder {
  constructor() {

  }

  build(minNode = 4, maxNode = 6) {
    maxNode = Math.max(minNode, maxNode);
    minNode = Math.min(minNode, maxNode);

    const nodeNum = random.randRange(minNode, maxNode);
    const alphabetCounter = new AlphabetCounter();
    let nodes = [];
    for(let i = 0; i < nodeNum; i++) {
      nodes.push(new Node(alphabetCounter.next()));
    }
    nodes = _.shuffle(nodes);

    let edgePair = [];
    for (let i = 0; i < nodeNum; i++) {
      for (let j = i + 1; j < nodeNum; j++) {
        edgePair.push([i,j]);
      }
    }
    edgePair = _.shuffle(edgePair);

    const useEdge = random.randPositive(edgePair.length);
    
    for (let i = 0; i < edgePair.length; i++) {
      let s = edgePair[i][0]
      let e = edgePair[i][1];
      if (i < useEdge || !nodes[s].hasChild()) {
        let direction = random.randInt(2);
        if (direction == 0 || nodes[s].hasRight()) {
          nodes[s].setLeft(nodes[e]);
        } else {
          nodes[s].setRight(nodes[e]);
        }
      }
    }

    console.log(nodes);
    return nodes;
  }
}

module.exports = GraphBuilder;