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
// async function generateSample() {
//   while(sampleID <= 1) {
//     const flowLang = [];

//     console.log(`Sample at: ${sampleID}`);
//     for (let i = 0; i < 1; i++) {
//       const codeLong = random.randRange(8,15);
//       const codeDepth = random.randRange(3,5);
//       const lang = langGenerator.generate(codeLong, codeDepth);
//       const graph = graphBuilder.build(lang);
//       for(let j = 0; j < 1; j++) {
//         const flow = GraphToFlow.convert(graph);
//         flowLang.push({
//           index: sampleID + '-' + (j + 1),
//           lang: flow
//         });
//       }

//       fs.writeFile(__dirname + `/../data/sample-${sampleID}-lang.txt`, LangHelper.parse(lang), () => { });
//       sampleID++;
//     }
    
//     await FlowToImage.toImage(flowLang, writeFlow = true);
//   }
// }

async function generateSample2() {
  
  const flow =
`st=>start: start
dcs1=>condition: condition1
st1=>operation: statement1
st2=>operation: statement2
st3=>operation: statement3
st4=>operation: statement4
st5=>operation: statement5
st6=>operation: statement6
dcs2=>condition: condition2
st7=>operation: statement7
dcs3=>condition: condition3
st8=>operation: statement8
dcs4=>condition: condition4
st9=>operation: statement9
end=>end: end
st->dcs1
dcs1(yes, bottom)->st1
dcs1(no)->st4
st1(right)->st2
st2(right)->st3
st3->st4
st4(right)->st5
st5(right)->st6
st6(right)->dcs2
dcs2(yes, bottom)->st7
dcs2(no)->dcs3
st7(right)->end
dcs3(yes, bottom)->st8
dcs3(no)->dcs4
st8(right)->end
dcs4(yes, bottom)->st9
dcs4(no)->end
st9->end`;

  const flowLang = [];

  for(let j = 0; j < 1; j++) {
    flowLang.push({
      index: 1 + '-' + (j + 1),
      lang: flow
    });
  }

  await FlowToImage.toImage(flowLang, writeFlow = true);
}

generateSample2();
