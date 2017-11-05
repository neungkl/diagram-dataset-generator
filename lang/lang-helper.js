const Token = require('./token');
const _ = require('lodash');

const validate = function(tokens) {
  if (!(tokens instanceof Array)) {
    throw new Error(`Unexpected token. Token should be array.`);
  }

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];
    const scopeDeep = 0;
    if (!(word instanceof Token)) {
      throw new Error(`Unexpected token. Incorrect token type ${word}`);

      if (_.includes(['for', 'while', 'if'], word.type)) {
        scopeDeep++;
      } else if(word.type === 'end') {
        scopeDeep--;
        throw new Error(`Unexpected token. Wrong scope ${word}`);
      }
    }
  }
}

const parse = function(words) {
  validate(words);

  let curSpaceSize = 0;
  let txt = '';
  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    let spaceSize = curSpaceSize;
    if (_.includes(['end', 'elseif', 'else'], word.type)) {
      spaceSize = Math.max(0, spaceSize - 2);
    }

    for (let j = 0; j < spaceSize; j++) txt += ' ';

    if (word.type === 'normal') {
      txt += word.info;
    } else if (word.type === 'for') {
      txt += `for ${word.info.i} in ${word.info.start}...${word.info.end}`;
    } else if (_.includes(['end', 'else'], word.type)) {
      txt += word.type;
    } else {
      txt += `${word.type} ${word.info}`;
    }

    if (_.includes(['for', 'while', 'if'], word.type)) {
      curSpaceSize += 2;
    } else if(word.type === 'end') {
      curSpaceSize -= 2;
    }

    txt += '\n';
  }

  return txt;
}

module.exports = {
  parse,
  validate
}