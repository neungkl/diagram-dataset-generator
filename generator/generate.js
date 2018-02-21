const GraphBuilder =  require('../graph/graph-builder');
const GraphToFlow = require('../parser/graph-to-flow');
const LangGenerator = require('../lang/lang-generator');
const LangHelper = require('../lang/lang-helper');
const LangParser = require('../lang/lang-parser');
const DatasetGenerator = require('./dataset-genrator');
const random = require('../utils/random');
const fs = require('fs');

const langGenerator = new LangGenerator();
const graphBuilder = new GraphBuilder();

const startSampleID = 1;
const sampleSize = 5;
const variationSize = 15;

let sampleID = startSampleID;
async function generateSample() {
  while(sampleID <= sampleSize) {
    const rawData = [];

    console.log(`Sample at: ${sampleID}`);
    
    for (let i = 0; i < variationSize && i < sampleSize; i++) {
      
      const codeLong = random.randRange(3,6);
      const codeDepth = random.randRange(1,3);
      const lang = langGenerator.generate(
        codeLong,
        codeDepth,
        randomInfo = true
      );
      const graph = graphBuilder.build(lang);

      for(let j = 0; j < variationSize; j++) {
        const flowOrigin = GraphToFlow.convert(
          graph,
          randomLabel = false,
          blockVariation = true
        );

        const flowWithBlankLabel = GraphToFlow.cleanLabel(flowOrigin);

        rawData.push({
          index: sampleID + '-' + (j + 1),
          lang: lang,
          flow: flowOrigin
        });
        rawData.push({
          index: sampleID + '-' + (j + 1) + '-blank',
          lang: lang,
          flow: flowWithBlankLabel
        })
      }

      fs.writeFile(__dirname + `/../data/sample-${sampleID}-lang.txt`, LangHelper.parse(lang), () => {});
      sampleID++;
    }
    
    await DatasetGenerator.generate(rawData, writeFlowFile = false);
  }
}

async function generateSingleSample() {
  const rawData = [];

  console.log(`Sample at: 1`);
      
  const codeLong = random.randRange(3,6);
  const codeDepth = random.randRange(1,3);
  const lang = langGenerator.generate(
    codeLong,
    codeDepth,
    randomInfo = true
  );
  const graph = graphBuilder.build(lang);

  for(let j = 0; j < 10; j++) {
    const flowOrigin = GraphToFlow.convert(
      graph,
      randomLabel = false,
      blockVariation = true
    );

    const flowWithBlankLabel = GraphToFlow.cleanLabel(flowOrigin);

    rawData.push({
      index: sampleID + '-' + (j + 1),
      lang: lang,
      flow: flowOrigin
    });
    rawData.push({
      index: sampleID + '-' + (j + 1) + '-blank',
      flow: flowWithBlankLabel
    })
  }

  fs.writeFile(__dirname + `/../data/sample-${sampleID}-lang.txt`, LangHelper.parse(lang), () => {});

  await DatasetGenerator.generate(rawData, writeFlowFile = false);
}

generateSample();
