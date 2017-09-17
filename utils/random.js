// random [0...n)
const randInt = function(n) {
  return Math.floor(Math.random() * n);
}

// random [n...m]
const randRange = function(n, m) {
  return randInt(m - n + 1) + n;
}

// random [1...n]
const randPositive = function(n) {
  return 1 + randInt(n);
}

module.exports = {
  randInt,
  randRange,
  randPositive
}