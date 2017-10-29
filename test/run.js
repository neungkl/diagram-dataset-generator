const GraphBuilder =  require('../graph/graph-builder');
const GraphToFlow = require('../parser/graph_to_flow');
const LangGenerator = require('../lang/lang-generator');
const LangHelper = require('../lang/lang-helper');
const FlowToImage = require('../parser/flow_to_image');

const l = new LangGenerator();
const g = new GraphBuilder();

lang = l.generate(15, 3);

// const gg = g.build(lang);
const gg = g.build(lang);
LangHelper.print(lang);
console.log(require('util').inspect(gg, false, 1));

const flow = GraphToFlow.convert(gg);

// LangHelper.print(lang);
console.log(flow);

FlowToImage.toImage(flow);

