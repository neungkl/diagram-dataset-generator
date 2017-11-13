const Token = require('./token');
const _ = require('lodash');

class LangParser {
  parse(lang) {
    let words = [];

    lang = lang.split('\n');

    for (let i = 0; i < lang.length; i++) {
      let l = lang[i];

      l = _.trim(l);

      if (l === '') continue;

      l = l.split(' ');
      let token = l.shift();
      l = l.join(' ');

      if (_.includes(['if', 'else', 'end', 'for', 'while', 'elseif'], token) === false)  {
        if (l === '') {
          words.push(new Token('normal', token));
        } else {
          words.push(new Token('normal', token + ' ' + l));
        }
      } else {
        if(_.includes(['end'], token)) {
          words.push(new Token(token));
        } else {
          words.push(new Token(token, l));
        }
      }
    }

    return words;
  }
}

module.exports = new LangParser();