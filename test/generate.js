const GraphBuilder =  require('../graph/graph-builder');
const GraphToFlow = require('../parser/graph-to-flow');
const LangGenerator = require('../lang/lang-generator');
const LangHelper = require('../lang/lang-helper');
const LangParser = require('../lang/lang-parser');
const FlowToImage = require('../parser/flow-to-image');
const random = require('../utils/random');
const fs = require('fs');

const langGenerator = new LangGenerator();
const graphBuilder = new GraphBuilder();

let sampleID = 1; 
async function generateSample() {
  while(sampleID <= 10) {
    const flowLang = [];

    console.log(`Sample at: ${sampleID}`);
    for (let i = 0; i < 5; i++) {
      const codeLong = random.randRange(5,10);
      const codeDepth = random.randRange(2,5);
      const lang = langGenerator.generate(codeLong, codeDepth);
      const graph = graphBuilder.build(lang);

      for(let j = 0; j < 20; j++) {
        const flow = GraphToFlow.convert(graph, true);
        flowLang.push({
          index: sampleID + '-' + (j + 1),
          lang: flow
        });
      }

      fs.writeFile(__dirname + `/../data/sample-${sampleID}-lang.txt`, LangHelper.parse(lang), () => { });
      sampleID++;
    }
    
    await FlowToImage.toImage(flowLang, writeFlow = true);
  }
}

async function generateSingleSample() {
  
  const flow =
`st=>start: start
dcs1=>condition: QasiCksHknCz
st1=>operation: dSmJIPimnr
st2=>operation: Vutyv
dcs2=>condition: DfvjQmnit
st3=>operation: puNjZTGxh
dcs3=>condition: cHlNBIVZaE
st4=>operation: rcjLayGSMU
end=>end: end
st(right)->dcs1
dcs1(yes, bottom)->st1
dcs1(no)->end
st1->st2
st2->dcs2
dcs2(yes, bottom)->st3
dcs2(no)->dcs3
st3(left)->dcs2
dcs3(yes, bottom)->st4
dcs3(no)->dcs1
st4(left)->dcs1`;

  const flowLang = [];

  for(let j = 0; j < 1; j++) {
    flowLang.push({
      index: 1 + '-' + (j + 1),
      lang: flow
    });
  }

  await FlowToImage.toImage(flowLang, writeFlow = true);
}

generateSample();
