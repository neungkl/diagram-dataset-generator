const puppeteer = require('puppeteer');
const svg2png = require("svg2png");
const fs = require('fs');

class FlowToImage {
  constructor() {
  }

  toImage(flowLang) {

    if (typeof flowLang === 'string') {
      flowLang = [flowLang];
    }

    puppeteer.launch({ headless: true }).then(async browser => {
      const page = await browser.newPage();
      page.on('error', msg => {
        console.log(error)
      });

      await page.goto(`file://${__dirname}/render_flow.html`)

      await page.waitForSelector('#finish');
      const diagramElm = await page.$('#diagram');

      for (let i = 0; i < flowLang.length; i++) {
        let lang = null;
        let index = null;
        if (typeof flowLang[i] === 'string') {
          lang = flowLang[i] + '\n'
        } else if (typeof flowLang[i] === 'object') {
          lang = flowLang[i].lang;
          index = flowLang[i].index;
        }
        if (!lang) throw new Error(`Bad Behavior #5: Flow Language is not defined`);

        await page.evaluate(lang => {
          var elm = document.querySelector('#diagram');
          elm.innerHTML = "";
          var diagram = flowchart.parse(lang);
          diagram.drawSVG('diagram');
          // elm.style.width = '100%';
        }, lang);

        let flowDir = __dirname + `/../data/sample-${i+1}-flow.txt`;
        if (index) flowDir = __dirname + `/../data/sample-${index}-flow.txt`;
        await fs.writeFileSync(flowDir, lang);

        // const html = await page.evaluate(body => body.innerHTML, diagramElm);
        // await svg2png(Buffer.from(html), { url: __dirname + `/../data/sample-${i+1}-flow.png` }).catch(e => console.log(e));
        console.log('!!!');

        await new Promise((resolve) => {
          setTimeout(resolve, 200);
        });

        let picDir =__dirname + `/../data/sample-${i+1}.png`;
        if (index) picDir = __dirname + `/../data/sample-${index}.png`; 
        await diagramElm.screenshot({ path: picDir, fullPage: false });
      }

      await diagramElm.dispose();
      await browser.close();
    });

  }

}

module.exports = new FlowToImage();
