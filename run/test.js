const GraphBuilder =  require('../graph/graph-builder');
const GraphToFlow = require('../parser/graph-to-flow');
const LangHelper = require('../lang/lang-helper');
const LangParser = require('../lang/lang-parser');
const fs = require('fs');

const graphBuilder = new GraphBuilder();

let lang = `
if condition1
statement1
elseif condition2
statement2
for i in 1...20
  statement3
end
end
`

lang = LangParser.parse(lang);
console.log(lang);
const graph = graphBuilder.build(lang);
const flow = GraphToFlow.convert(graph);
console.log(flow);

