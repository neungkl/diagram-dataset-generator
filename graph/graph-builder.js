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

  _transformToScope(tokens, isSubtoken = false) {
    let scope = [];
    const type = tokens[0].type;

    const getSubtokens = function (i) {
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

    if (isSubtoken) {
      if (type === 'if') {
        let subscope = [];
        let deep = 0;

        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];

          if (_.includes(['for', 'while', 'if'], token.type)) deep++;
          else if (token.type === 'end') deep--;

          if (_.includes(['if', 'elseif', 'else'], token.type) && deep === 1) {
            if (subscope.length) {
              const front = subscope[0];
              subscope.shift();
              scope.push(
                _.concat(front, this._transformToScope(subscope))
              );
            }
            subscope = [token];
          } else {
            subscope.push(token);
          }
        }
        if (subscope.length) {
          const front = subscope[0];
          subscope.shift();
          subscope.pop();
          scope.push(
            _.concat(front, this._transformToScope(subscope))
          );
        }

        return scope;
      } else {
        const front = tokens.shift();
        const end = tokens.pop();
        return _.concat(front, this._transformToScope(tokens));
      }
    } else {
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === 'normal') {
          scope.push(token);
        } else {
          const subtokens = getSubtokens(i);
          i += subtokens.length - 1;
          scope.push(this._transformToScope(subtokens, true));
        }
      }
    }

    return scope;
  }

  _convertToScopeBlock(tokens) {
    let nodeId = 1;

    const stampBlockScope = function (scope) {
      if (_.isArray(scope)) {
        let node = [];
        for (let i = 0; i < scope.length; i++) {
          node.push(stampBlockScope(scope[i]));
        }
        if (node[0].type === 'else') {
          node[0].id = node[1].id;
        }
        return node;
      } else if (scope instanceof Token) {
        if (scope.type === 'normal') {
          return {
            type: 'normal',
            id: nodeId++,
            next: null,
            info: scope.info
          };
        } else if (scope.type === 'else') {
          return {
            type: 'else',
            next: null
          };
        } else if (scope.type !== 'end') {
          return {
            type: scope.type,
            id: nodeId++,
            next: null,
            alt: null,
            info: scope.info
          };
        }
      } else {
        return {
          type: 'none'
        };
      }
    }

    const getHead = function (head) {
      if (_.isArray(head)) {
        return getHead(head[0]);
      } else {
        return head;
      }
    }

    const assignChildNextNull = function (child, id) {
      if (_.isArray(child)) {
        for (let i = 0; i < child.length; i++) {
          assignChildNextNull(child[i], id);
        }
      } else if (_.isObject(child)) {
        if (_.isNull(child.next)) child.next = id;
      } else {
        throw new Error(`Bad behavior #02`);
      }
    }

    const assignChildAltNull = function (child, id) {
      if (_.isArray(child)) {
        for (let i = 0; i < child.length; i++) {
          assignChildAltNull(child[i], id);
        }
      } else if (_.isObject(child)) {
        if (_.isNull(child.alt)) child.alt = id;
      } else {
        throw new Error(`Bad behavior #03`);
      }
    }

    const connectNode = function (nodes, nodesAdjust = null) {
      if (_.isArray(nodes)) {
        for (let i = 0; i < nodes.length; i++) {
          connectNode(nodes[i], (i < nodes.length - 1 ? nodes[i + 1] : null));
        }
        if (_.isArray(nodes[0]) && nodes[0][0].type === 'if') {
          for (let i = 0; i < nodes.length - 1; i++) {
            nodes[i][0].alt = nodes[i + 1][0].id;
          }
        } else {
          for (let i = 0; i < nodes.length - 1; i++) {
            if (!_.isArray(nodes[i])) {
              if (_.isNull(nodes[i].next)) {
                nodes[i].next = getHead(nodes[i + 1]).id;
              } else {
                throw new Error(`Bad behavior #01`);
              }
            }
          }
        }

        if (_.isObject(nodes[0]) && _.includes(['while', 'for'], nodes[0].type)) {
          assignChildNextNull(nodes, nodes[0].id);
          assignChildAltNull(nodes.slice(1), nodes[0].id);
        } else if (_.isArray(nodes[0]) && nodes[0][0].type === 'if') {
          if (!_.isNull(nodesAdjust))
            assignChildNextNull(nodes, getHead(nodesAdjust).id);
        }
        if (!_.isNull(nodesAdjust)) {
          assignChildAltNull(nodes, getHead(nodesAdjust).id);
        }
      }
    }

    const scope = this._transformToScope(tokens);
    const scopeBlock = stampBlockScope(scope);
    scopeBlock.push({
      type: 'end',
      id: nodeId++
    });

    connectNode(scopeBlock);

    return scopeBlock;
  }

  build(tokens) {
    LangHelper.validate(tokens);

    let graph = [];
    const scopeBlock = this._convertToScopeBlock(tokens);

    // console.log(require('util').inspect(scopeBlock, false, 10));

    graph.push(new StartNode());

    let flattenScopeBlock = [];

    const flatten = function (block) {
      if (_.isArray(block)) {
        for (let i = 0; i < block.length; i++)
          flatten(block[i]);
      } else if (_.isObject(block)) {
        flattenScopeBlock[block.id] = block;
      } else {
        throw new Error(`Bad Behavior #4`);
      }
    }

    flatten(scopeBlock);
    
    for (let i = 1; i < flattenScopeBlock.length; i++) {
      const block = flattenScopeBlock[i];
      const info = block.info;
      if (block.type === 'normal') {
        graph[i] = new SimpleNode(info);
      } else if (block.type === 'for') {
        graph[i] = new DecisionNode(`${info.i} = ${info.start} to ${info.end}`);
      } else if (block.type === 'end') {
        graph[i] = new EndNode();
      } else {
        graph[i] = new DecisionNode(info);
      }
    }

    // Connect each component

    graph[0].setNext(graph[1]);
    for (let i = 1; i < flattenScopeBlock.length - 1; i++) {
      const block = flattenScopeBlock[i];

      if (graph[i] instanceof SimpleNode) {
        graph[i].setNext(graph[block.next]);
      } else if (graph[i] instanceof DecisionNode) {
        graph[i].setLeft(graph[block.next]);
        graph[i].setRight(graph[block.alt]);
      }
    }

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
            frontNode.setNext(simpleNodes[random.randInt(simpleNodes.length -
              1)]);
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
    while (Q.length > 0) {
      const frontNode = Q[0];
      if (frontNode instanceof SimpleNode) {
        if (!frontNode.hasNext()) {
          frontNode.setNext(endNode);
        }
      } else if (frontNode instanceof DecisionNode) {
        if (!frontNode.hasLeft()) {
          frontNode.setLeft(endNode);
        } else if (!frontNode.hasRight()) {
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
