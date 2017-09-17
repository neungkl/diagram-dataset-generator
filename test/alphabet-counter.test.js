import test from 'ava';
import AlphabetCounter from '../utils/alphabet-counter';

test(t => {
  const c = new AlphabetCounter();

  const list = ["a", "b", "c", "d"];
  for(let i = 0; i < list.length; i++) {
    t.is(list[i], c.next());
  }
});

test(t => {
  const c = new AlphabetCounter();

  const list = ["z", "aa", "ab", "ac", "ad"];
  for(let i = 0; i < 25; i++) c.next();
  for(let i = 0; i < list.length; i++) {
    t.is(list[i], c.next());
  }
});