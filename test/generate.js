const GraphBuilder =  require('../graph/graph-builder');
const GraphToFlow = require('../parser/graph_to_flow');
const LangGenerator = require('../lang/lang-generator');
const LangHelper = require('../lang/lang-helper');
const FlowToImage = require('../parser/flow_to_image');
const random = require('../utils/random');
const fs = require('fs');

const langGenerator = new LangGenerator();
const graphBuilder = new GraphBuilder();

let sampleID = 1; 
async function generateSample() {
  while(sampleID < 10) {
    const flowLang = [];

    console.log(`Sample at: ${sampleID}`);
    for (let i = 0; i < 5; i++) {
      const codeLong = random.randRange(8,15);
      const codeDepth = random.randRange(3,5);
      const lang = langGenerator.generate(codeLong, codeDepth);
      const graph = graphBuilder.build(lang);
      for(let j = 0; j < 10; j++) {
        const flow = GraphToFlow.convert(graph);
        flowLang.push({
          index: sampleID + '-' + (j + 1),
          lang: flow
        });
      }

      fs.writeFileSync(__dirname + `/../data/sample-${sampleID}-lang.txt`, LangHelper.parse(lang));
      sampleID++;
    }
    
    await FlowToImage.toImage(flowLang);
  }
}

generateSample();
