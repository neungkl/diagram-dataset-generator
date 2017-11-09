const GraphBuilder =  require('../graph/graph-builder');
const GraphToFlow = require('../parser/graph_to_flow');
const LangGenerator = require('../lang/lang-generator');
const LangHelper = require('../lang/lang-helper');
const FlowToImage = require('../parser/flow_to_image');
const random = require('../utils/random');
const fs = require('fs');

const langGenerator = new LangGenerator();
const graphBuilder = new GraphBuilder();

const flowLang = [];

for (let i = 0; i < 10; i++) {
  const codeLong = random.randRange(8,15);
  const codeDepth = random.randRange(3,5);
  const lang = langGenerator.generate(codeLong, codeDepth);
  const graph = graphBuilder.build(lang);
  for(let j = 0; j < 3; j++) {
    const flow = GraphToFlow.convert(graph);
    flowLang.push({
      index: (i + 1) + '-' + (j + 1),
      lang: flow
    });
  }

  fs.writeFileSync(__dirname + `/../data/sample-${i+1}-lang.txt`, LangHelper.parse(lang));
}

FlowToImage.toImage(flowLang);

