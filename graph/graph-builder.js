const AlphabetCounter = require('../utils/alphabet-counter');
const DecisionNode = require('./decision-node');
const SimpleNode = require('./simple-node');
const StartNode = require('./start-node');
const EndNode = require('./end-node');

const LangHelper = require('../lang/lang-helper');
const Token = require('../lang/token');

const random = require('../utils/random');
const _ = require('lodash');

class GraphBuilder {
  constructor() {}

  createRandomNode(prob = 0.5) {
    if (random.rand() > prob) {
      return new SimpleNode();
    } else {
      return new DecisionNode();
    }
  }

  _transformToScope(tokens) {
    let scope = [];
    const type = tokens[0].type;

    const getSubtokens = function(i) {
      let subtokens = [tokens[i]];
      let deep = 1;
      for (let j = i + 1; j < tokens.length; j++) {
        const token = tokens[j];
        if (token.type === 'end') deep--;
        else if (_.includes(['for', 'while', 'if'], token.type)) deep++;
        subtokens.push(tokens[j]);
        if (deep === 0) break;
      }

      return subtokens;
    }

    if (type === 'if') {
      let subscope = [];

      tokens.pop();
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === 'normal') {
          subscope.push(token);
        } else if(_.includes(['if', 'elseif', 'else'], token.type)) {
          if (subscope.length) {
            scope.push(subscope);
          }
          subscope = [token];
        } else {
          const subtokens = getSubtokens(i);
          i += subtokens.length - 1;
          // subscope.push(this._transformToScope(subtokens));
        }
      }
      if (subscope.length) {
        scope.push(subscope);
      }

      return scope;

    } else if (type !== 'normal') {
      scope.push(tokens[0]);
      tokens.shift();
      tokens.pop();
    }

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type === 'normal') {
        scope.push(token);
      } else {
        const subtokens = getSubtokens(i);
        i += subtokens.length - 1;
        // scope.push(this._transformToScope(subtokens));
      }
    }

    return scope;
  }

  build(tokens) {
    LangHelper.validate(tokens);

    let graph = [];
    let scopeStack = [];
    let scopeStackType = [];
    let requireLinkIf = false;
    let requireLinkLoop = false;
    let lastLoopNode;

    const connectToUnconnect = function(node) {
      for (let i = 0; i < graph.length; i++) {
        if (graph[i] instanceof SimpleNode) {
          if (!graph[i].hasNext()) {
            graph[i].setNext(node);
          }
        }
      }
    }

    graph.push(new StartNode());

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === 'end') {
        if (_.last(scopeStackType) === 'if') {
          requireLinkIf = true;
        } else {
          requireLinkLoop = true;
          lastLoopNode = _.last(scopeStack);
        }
        scopeStack.pop();
        scopeStackType.pop();
      } else {

        if (requireLinkLoop) {
          connectToUnconnect(lastLoopNode);
          requireLinkLoop = false;
          requireLinkIf = false;
        }

        let node;

        if (token.type === 'normal') {
          node = new SimpleNode(token.info);
        } else if (_.includes(['for', 'while'], token.type)) {
          node = new DecisionNode(token.info);
          scopeStack.push(node);
          scopeStackType.push('loop');
        } else {
          node = new DecisionNode(token.info);

          if (requireLinkIf) {
            connectToUnconnect(node);
            requireLinkIf = false;
          }

          scopeStack.push(node);
          scopeStackType.push('if');
        }

        if (i > 0) {
          const lastNode = _.last(graph);
          if (lastNode instanceof DecisionNode) {
            lastNode.setRight(node);
          } else {
            lastNode.setNext(node);
          }
        }

        graph.push(node);
      }
    }

    const node = new EndNode();
    connectToUnconnect(node);
    graph.push(node);

    return graph;
  }

  buildRandom(iterate = 8) {
    let Q = [];
    let simpleNodes = [];
    let graph = [];

    const probDesicion = 0.4;
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
          if (random.rand() > probBack || simpleNodes.length <= 1) {
            frontNode.setNext(node);
          } else if (Q.length > 1) {
            shouldAdd = false;
            frontNode.setNext(simpleNodes[random.randInt(simpleNodes.length - 1)]);
            Q.shift();
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