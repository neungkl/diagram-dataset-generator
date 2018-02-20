const puppeteer = require('puppeteer');
const fs = require('fs');
const svgValidator = require('../validator/svg-validator');

const renderGraph = flow => {
  var elm = document.querySelector('#diagram');
  elm.innerHTML = "";
  var diagram = flowchart.parse(flow);
  diagram.drawSVG('diagram', {
    flowstate: {
      blank: { 'font-color': 'white' }
    }
  });
}

const getWordPosition = () => {
  var $text = $("text");
  var words = [];
  for (let i = 0; i < $text.length; i++) {
    var text = $($text[i]).text();
    if (text === 'start' ||
      text === 'end' ||
      text === 'yes' ||
      text === 'no') continue;
    words.push($($text[i]).text())
  }
  return words;
}

function generateBuilder(flowLang, current, size, page) {
  return new Promise(async (resolve, reject) => {
    const diagramElm = await page.$('#diagram');

    console.log(`Generate ${current+1}/${size}`);

    let flow = null;
    let index = null;
    let lang = null;
    if (typeof flowLang === 'string') {
      flow = flowLang + '\n'
    } else if (typeof flowLang === 'object') {
      flow = flowLang.flow;
      lang = flowLang.lang;
      index = flowLang.index;
    }

    if (!flow) throw new Error(`Bad Behavior #5: Flow Language is not defined`);

    const rect = await page.evaluate(renderGraph, flow);

    const svgTag = await page.evaluate(body => body.innerHTML, diagramElm);
    
    if (!svgValidator.validate(svgTag)) {
      await diagramElm.dispose();
      return resolve('reject');
    }

    if (lang) {
      const wordPosition = await page.evaluate(getWordPosition);
      console.log(wordPosition);
    }


    if (writeFlowFile) {
      let flowDir = __dirname + `/../data/sample-${current+1}-flow.txt`;
      if (index) flowDir = __dirname + `/../data/sample-${index}-flow.txt`;
      fs.writeFile(flowDir, flow, () => { });
    }
    
    let picDir = __dirname + `/../data/sample-${current+1}.jpg`;
    if (index) picDir = __dirname + `/../data/sample-${index}.jpg`;

    await diagramElm.screenshot({ path: picDir, fullPage: false, type: 'jpeg' });
    await diagramElm.dispose();

    resolve('pass');
  });
}

class DatasetGenerator {
  constructor() {
  }

  async generate(flowLang, writeFlowFile = false, threadSize = 8) {

    if (typeof flowLang === 'string') {
      flowLang = [flowLang];
    }

    await puppeteer.launch({ headless: false }).then(async browser => {

      let builderPool = [];
      let pagePool = [];

      for (let j = 0; j < threadSize; j++) {
        const page = await browser.newPage();
        page.on('error', msg => {
          console.log(error)
        });
        page.setViewport({ width: 1280, height: 800 });

        await page.goto(`file://${__dirname}/render-flow.html`);
        await page.waitForSelector('#finish');

        pagePool.push(page);
      }

      for (let i = 0; i < flowLang.length; i += threadSize) {
        for (let j = 0; j < threadSize; j++) {
          if (i + j < flowLang.length) {
            builderPool.push(generateBuilder(
              flowLang[i + j],
              i + j,
              flowLang.length,
              pagePool[j]
            ));
          }
        }
        await Promise.all(builderPool);
        builderPool = [];
      }

      for (let j = 0; j < threadSize; j++) {
        await pagePool[j].close();
      }
      
      await browser.close();
    });

  }

}

module.exports = new DatasetGenerator();
