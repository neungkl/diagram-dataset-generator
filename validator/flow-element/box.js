const Line = require('./line');

class Box {
  constructor(x, y, width, height, type = 'rect') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
  }

  collideWithLine(line, pad) {
    let sw = this.x;
    let ew = this.x + this.width;
    let sh = this.y;
    let eh = this.y + this.height;

    const x1 = line.x1;
    const x2 = line.x2;
    const y1 = line.y1;
    const y2 = line.y2;

    sw += pad;
    ew -= pad;
    sh += pad;
    eh -= pad;

    if (sw < x2 && x1 < ew && sh < y2 && y1 < eh) {
      return true;
    }
    return false;
  }

  collideWithBox(box, pad) {
    let sw = this.x;
    let ew = this.x + this.width;
    let sh = this.y;
    let eh = this.y + this.height;

    const x1 = box.x;
    const x2 = box.x + box.width;
    const y1 = box.y;
    const y2 = box.y + box.height;
    
    if (sw < x2 && x1 < ew && sh < y2 && y1 < eh) {
      return true;
    }
    return false;  
  }

  collideWith(obj, pad) {
    if (typeof pad !== 'number') throw new Error('Please specific pad number');

    if (obj instanceof Line) {
      return this.collideWithLine(obj, pad);
    } else {
      return this.collideWithBox(obj);
    }
  }

  isNear(line, pad) {
    if (!pad) throw new Error('Please specific pad number');

    let sw = this.x;
    let ew = this.x + this.width;
    let sh = this.y;
    let eh = this.y + this.height;

    const x1 = line.x1;
    const x2 = line.x2;
    const y1 = line.y1;
    const y2 = line.y2;

    const eps = 1e-5;
    if (Math.abs(x1 - x2) < eps) {
      sw -= pad;
      ew += pad;
      sh += pad;
      eh -= pad;
    } else if (Math.abs(y1 - y2) < eps) {
      sw += pad;
      ew -= pad;
      sh -= pad;
      eh += pad;
    }

    if (sw < x2 && x1 < ew && sh < y2 && y1 < eh) {
      return true;
    }
    return false;
  }
}

module.exports = Box;