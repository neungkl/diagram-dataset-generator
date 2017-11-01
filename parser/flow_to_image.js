const puppeteer = require('puppeteer');
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
        flowLang[i] += '\n';

        await page.evaluate(flowLang => {
          var diagram = flowchart.parse(flowLang);
          diagram.drawSVG('diagram');
        }, flowLang[i])

        await fs.writeFileSync(__dirname + `/../data/sample-${i+1}.txt`, flowLang[i]);

        // const html = await page.evaluate(body => body.innerHTML, diagramElm);

        await diagramElm.screenshot({ path: `data/sample-${i+1}.png`, fullPage: false });
      }

      await diagramElm.dispose();
      await browser.close();
    });

  }

}

module.exports = new FlowToImage();
