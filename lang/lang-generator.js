const Token = require('./token');
const random = require('../utils/random');
const _ = require('lodash');

class LangGenerator {
  constructor() {

  }

  generate(iterate = 16, deep = 2) {
    let words = [];
    let statementCnt = 1;
    let conditionCnt = 1;
    let scopeStack = [];
    let nextIsStatement = false;

    for (let i = 0; i < iterate; i++) {
      if(nextIsStatement || random.rand() > 0.7) {
        nextIsStatement = false;
        words.push(new Token('normal', 'statement' + statementCnt++));
      } else {
        nextIsStatement = true;

        let lastScope = '';
        if (scopeStack.length > 0) lastScope = _.last(scopeStack);

        if (lastScope === 'else') {
          scopeStack.pop();
          lastScope = _.last(scopeStack);
          words.push(new Token('end'));
        }

        if (scopeStack.length > 0 && random.rand() > 0.7) {
          // choose end
          words.push(new Token('end'));
          scopeStack.pop();
          continue;
        }
        
        if (random.rand() > 0.5) {
          // choose if
          if (lastScope === 'if') {
            if (random.rand() > 0.5) {
              words.push(new Token('elseif', 'condition' + conditionCnt++));
            } else if(random.rand() > 0.25) {
              words.push(new Token('else'));
              scopeStack.pop();
              scopeStack.push('else');
            } else {
              words.push(new Token('end'));
              scopeStack.pop();
            }
          } else {
            if (scopeStack.length >= deep) {
              words.push(new Token('end'));
              scopeStack.pop();
            }

            words.push(new Token('if', 'condition' + conditionCnt++));
            scopeStack.push('if');
          }
        } else {
          // chose loop
          if (scopeStack.length >= deep) {
            words.push(new Token('end'));
            scopeStack.pop();
          }

          if (random.rand() > 0.3) {
            words.push(new Token('for', {i: 'i', start: 1, end: 20}));
          } else {
            words.push(new Token('while', 'condition' + conditionCnt++));
          }
          scopeStack.push('loop');
        }
      }
    }

    if (nextIsStatement) {
      words.push(new Token('normal', 'statement' + statementCnt++));
    }
    while (scopeStack.length > 0) {
      words.push(new Token('end'));
      scopeStack.pop();
    }

    return words;
  }
}

module.exports = LangGenerator;