class Box {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  collideWith(line, pad = 0) {
    const sw = this.x + pad;
    const ew = this.x + this.width - pad;
    const sh = this.y + pad;
    const eh = this.y + this.height - pad;

    let x1 = line.x1;
    let x2 = line.x2;
    let y1 = line.y1;
    let y2 = line.y2;

    if (x1 > x2) {
      [x1, x2] = [x2, x1];
    }
    if (y1 > y2) {
      [y1, y2] = [y2, y1];
    }

    if (sw < x2 && x1 < ew && sh < y2 && y1 < eh) {
      return true;
    }
    return false;
  }
}

module.exports = Box;