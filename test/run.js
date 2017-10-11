const GraphBuilder =  require('../graph/graph-builder');
const GraphToFlow = require('../parser/graph_to_flow');
const LangGenerator = require('../lang/lang-generator');
const LangHelper = require('../lang/lang-helper');

const l = new LangGenerator();
const g = new GraphBuilder();

lang = l.generate(20, 3);

// const gg = g.build(lang);
const gg = g._transformToScope(lang);
LangHelper.print(lang);
console.log(require('util').inspect(gg, false, 10));
// const flow = GraphToFlow.convert(gg);

// LangHelper.print(lang);
// console.log(flow);

