import test from 'ava';
import GraphBuilder from '../builder/graph-builder';

test(t => {
  const g = new GraphBuilder();

  console.log(g.buildRandom(20));

  t.pass();
})