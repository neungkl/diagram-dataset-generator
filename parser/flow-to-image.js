const puppeteer = require('puppeteer');
const fs = require('fs');

class FlowToImage {
  constructor() {
  }

  async toImage(flowLang, writeFlow = false) {

    if (typeof flowLang === 'string') {
      flowLang = [flowLang];
    }

    await puppeteer.launch({ headless: true }).then(async browser => {

      function generateBuilder(flowLang, current, size, page) {
        return new Promise(async (resolve, reject) => {
          const diagramElm = await page.$('#diagram');
  
          console.log(`Generate ${current+1}/${size}`);
  
          let lang = null;
          let index = null;
          if (typeof flowLang === 'string') {
            lang = flowLang + '\n'
          } else if (typeof flowLang === 'object') {
            lang = flowLang.lang;
            index = flowLang.index;
          }
          if (!lang) throw new Error(`Bad Behavior #5: Flow Language is not defined`);
  
          const rect = await page.evaluate(lang => {
            var elm = document.querySelector('#diagram');
            elm.innerHTML = "";
            var diagram = flowchart.parse(lang);
            diagram.drawSVG('diagram');
  
            // const { x, y, width, height } = elm.getBoundingClientRect();
            // return { left: x, top: y, width, height, id: elm.id };
          }, lang);
  
          if (writeFlow) {
            let flowDir = __dirname + `/../data/sample-${current+1}-flow.txt`;
            if (index) flowDir = __dirname + `/../data/sample-${index}-flow.txt`;
            await fs.writeFileSync(flowDir, lang);
          }
  
          // const html = await page.evaluate(body => body.innerHTML, diagramElm);
  
          let picDir = __dirname + `/../data/sample-${current+1}.jpg`;
          if (index) picDir = __dirname + `/../data/sample-${index}.jpg`;
      
          const padding = 5;
          // await page.screenshot({
          //   path: picDir,
          //   clip: {
          //     x: rect.left - padding,
          //     y: rect.top - padding,
          //     width: rect.width + padding * 2,
          //     height: rect.height + padding * 2,
          //   },
          // });
          await diagramElm.screenshot({ path: picDir, fullPage: false, type: 'jpeg' });
  
          await diagramElm.dispose();

          resolve('pass');
        });
      }

      let builderPool = [];
      let pagePool = [];
      const threadSize = 8;

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

module.exports = new FlowToImage();