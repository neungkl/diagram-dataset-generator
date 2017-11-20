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

    const x1 = line.x1;
    const x2 = line.x2;
    const y1 = line.y1;
    const y2 = line.y2;

    if (sw < x2 && x1 < ew && sh < y2 && y1 < eh) {
      return true;
    }
    return false;
  }
}

module.exports = Box;