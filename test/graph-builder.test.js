import test from 'ava';
import GraphBuilder from '../builder/graph-builder';
import GraphToFlow from '../parser/graph_to_flow';
import FlowToPng from '../parser/flow_to_png';

test(t => {
  const g = new GraphBuilder();

  const gg = g.buildRandom(20);
  const flow = GraphToFlow.convert(gg);
  console.log(flow);
  // console.log(FlowtoPng.toImage(flow));

  t.pass();
})