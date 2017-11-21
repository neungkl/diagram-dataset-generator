const cheerio = require('cheerio');
const Box = require('./flow-element/box');
const Line = require('./flow-element/line');

class SVGChecker {
  constructor() { }

  convertMatrixToXY(matrixStr) {
    const re = /^matrix\(\-?\d+\.?\d*,\-?\d+\.?\d*,\-?\d+\.?\d*,\-?\d+\.?\d*,(\-?\d+\.?\d*),(\-?\d+\.?\d*)\)$/;
    const found = matrixStr.match(re);

    return [+found[1], +found[2]];
  }

  getBoundaryFromPath(path) {
    const re = /((M|L)(\-?\d+\.?\d*),(\-?\d+\.?\d*))|(C((\-?\d+\.?\d*),){4}(\-?\d+\.?\d*),(\-?\d+\.?\d*))/g;
    const reCmd = /^.(\-?\d+\.?\d*),(\-?\d+\.?\d*)$/;
    const pathExtract = path.match(re);

    let width = 0;
    let height = 0;

    for (let i = 0; i < pathExtract.length; i++) {
      const cmd = pathExtract[i];
      const cmdExtract = cmd.match(reCmd);

      const x = +cmdExtract[1];
      const y = +cmdExtract[2];

      width = x > width ? x : width;
      height = y > height ? y : height;
    }

    return [width, height];
  }

  getLineSequence(path) {
    const re = /((M|L)(\-?\d+\.?\d*),(\-?\d+\.?\d*))|(C((\-?\d+\.?\d*),){4}(\-?\d+\.?\d*),(\-?\d+\.?\d*))/g;
    const reCmdFirst = /^.(\-?\d+\.?\d*),(\-?\d+\.?\d*)$/;
    const reCmd = /^.((\-?\d+\.?\d*),){4}(\-?\d+\.?\d*),(\-?\d+\.?\d*)$/;
    
    const pathExtract = path.match(re);
    const lineSeq = [];
    
    let prevX, prevY;
    for (let i = 0; i < pathExtract.length; i++) {
      const cmd = pathExtract[i];
      let x, y;

      if (i == 0) {
        const cmdExtract = cmd.match(reCmdFirst);
        x = +cmdExtract[1];
        y = +cmdExtract[2]; 
      } else {
        const cmdExtract = cmd.match(reCmd);
        x = +cmdExtract[3];
        y = +cmdExtract[4];

        lineSeq.push({
          x1: prevX,
          y1: prevY,
          x2: x,
          y2: y
        })
      }
      prevX = x;
      prevY = y;
    }

    return lineSeq;
  }

  transformSvgToObjectList(svgText) {
    const $ = cheerio.load(svgText);
    const $top = $('svg');

    const elements = $top.children('.flowchart');
    const paths = $top.children('path').not('.flowchart');

    const boxObjs = [];
    const lineObjs = [];

    for (let i = 0; i < elements.length; i++) {
      const element = elements.eq(i);
      const transform = element.attr('transform');
      const [x, y] = this.convertMatrixToXY(transform);

      if (element.is('path')) {
        const d = element.attr('d');
        const [width, height] = this.getBoundaryFromPath(d);
        boxObjs.push(new Box(x, y, width, height, 'diamond'));
      } else {
        const width = +element.attr('width');
        const height = +element.attr('height');

        boxObjs.push(new Box(x, y, width, height));
      }
    }

    for (let i = 0; i < paths.length; i++) {
      const path = paths.eq(i);
      const d = path.attr('d');

      const lineSeq = this.getLineSequence(d);
      for (let j = 0; j < lineSeq.length; j++) {
        lineObjs.push(new Line(
          lineSeq[j].x1,
          lineSeq[j].y1,
          lineSeq[j].x2,
          lineSeq[j].y2
        ));
      }
    }

    return [boxObjs, lineObjs];
  }

  checkCollision(boxs = [], lines = []) {
    for (let i = 0; i < boxs.length; i++) {
      for (let j = 0; j < i; j++) {
        if (boxs[i].collideWithBox(boxs[j])) return true;
      }
    }

    for (let i = 0; i < boxs.length; i++) {
      for (let j = 0; j < lines.length; j++) {
        if (boxs[i].type === 'rect') {
          // rect shape
          if (boxs[i].collideWithLine(lines[j], 1)) return true;
          if (boxs[i].isNear(lines[j], 7)) return true;
        } else {
          // diamond shape
          if (boxs[i].collideWithLine(lines[j], 10)) return true;
        }
      }
    }

    for (let i = 0; i < lines.length; i++) {
      for (let j = 0; j < i; j++) {
        if (lines[i].collideWithLine(lines[j], 1, 10)) return true;
      }
    }

    return false;
  }

  validate(svgText) {
    const [boxs, lines] = this.transformSvgToObjectList(svgText);
    return this.checkCollision(boxs, lines);
  }
}

module.exports = new SVGChecker();