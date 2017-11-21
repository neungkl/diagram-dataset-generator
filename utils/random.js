const generateID = require('nanoid/generate');

// randInt [0...n)
const randInt = function(n) {
  return Math.floor(Math.random() * n);
}

// randRange [n...m]
const randRange = function(n, m) {
  return randInt(m - n + 1) + n;
}

// randPositive [1...n]
const randPositive = function(n) {
  return 1 + randInt(n);
}

const rand = function() {
  return Math.random();
}

const randWord = function (length) {
  return generateID(
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    length
  );
}

module.exports = {
  randInt,
  randRange,
  randPositive,
  rand,
  randWord
}