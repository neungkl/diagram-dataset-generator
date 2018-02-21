const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
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
    var elm = $text[i];
    var text = $(elm).text();

    var box = elm.getBoundingClientRect();
    words.push({
      x: box.x + box.width / 2,
      y: box.y + box.height / 2,
      text: text
    });
  }
  return words;
}

const generateBlockPosition = (blockPosition, lang) => {
  const wordPosition = [];

  for (let i = 0; i < lang.length; i++) {
    let bType = lang[i].type;

    if (bType === 'end') {
      wordPosition.push(`end,-1,-1`);
      continue;
    }

    let x, y;

    for (let j = 0; j < blockPosition.length; j++) {
      if (blockPosition[j].text === lang[i].info) {
        x = blockPosition[j].x - 10;
        y = blockPosition[j].y - 10;
        break;
      }
    }

    if (bType === 'normal') bType = 'statement';

    wordPosition.push(`${bType},${x},${y}`);
  }

  return wordPosition.join('\n');
}

function generateBuilder(flowLang, current, size, page) {
  return new Promise(async (resolve, reject) => {
    const diagramElm = await page.$('#diagram');
    const dataDir = path.join(__dirname, '..', 'data');

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

    if (lang && index.indexOf("blank") == -1) {
      const blockPosition = await page.evaluate(getWordPosition);

      const wordPosition = generateBlockPosition(blockPosition, lang);

      let blockPosDir = path.join(
        dataDir, 
        index ? `sample-${index}-block-pos.csv` : `sample-${current+1}-block-pos.csv`
      );
      fs.writeFile(blockPosDir, wordPosition, () => {});
    }

    if (writeFlowFile) {
      let flowDir = path.join(
        dataDir,
        index ? `sample-${index}-flow.txt` : `sample-${current+1}-flow.txt`
      );
      fs.writeFile(flowDir, flow, () => { });
    }
    
    let picDir = path.join(
      dataDir,
      index ? `sample-${index}.jpg` : `sample-${current+1}.jpg`
    );

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

    await puppeteer.launch({ headless: true }).then(async browser => {

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
