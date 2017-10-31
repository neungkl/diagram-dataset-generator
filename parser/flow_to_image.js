const puppeteer = require('puppeteer');

class FlowToImage {
  constructor() {
  }

  toImage(flowLang) {
    
    puppeteer.launch({ headless: true }).then(async browser => {
      const page = await browser.newPage();
      page.on('error', msg => {
        console.log(error)
      });
      
      await page.goto(`file://${__dirname}/render_flow.html`)

      await page.waitForSelector('#finish')
      await page.evaluate((flowLang) => {
        var diagram = flowchart.parse(flowLang);
        diagram.drawSVG('diagram');
      }, flowLang)

      const diagramElm = await page.$('#diagram');
      const html = await page.evaluate(body => body.innerHTML, diagramElm);

      await diagramElm.screenshot({ path: 'data/sample.png', fullPage: false })
      await diagramElm.dispose();
      await browser.close();
    });

  }

}

module.exports = new FlowToImage();
