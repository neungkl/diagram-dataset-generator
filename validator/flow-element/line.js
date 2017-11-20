class Line {
  constructor(x1, y1, x2, y2) {
    if (x1 > x2) {
      this.x1 = x2;
      this.x2 = x1;
    } else {
      this.x1 = x1;
      this.x2 = x2;
    }

    if (y1 > y2) {
      this.y1 = y2;
      this.y2 = y1;
    } else {
      this.y1 = y1;
      this.y2 = y2;
    }
  }

  collideWithLine(line) {
    const eps = 1e-5;
    if (Math.abs(this.x1 - this.x2) < eps) {
      if (Math.abs(line.x1 - line.x2) < eps) {
        const dist = Math.abs(this.x1 - line.x1);
        if (dist > 2 && dist < 12) return true;
      }
    } else if (Math.abs(this.y1 - this.y2) < eps) {
      if (Math.abs(line.y1 - line.y2) < eps) {
        const dist = Math.abs(this.y1 - line.y1);
        if (dist > 2 && dist < 12) return true;
      }
    }
    return false;
  }
}

module.exports = Line;