$(function () {
  var canvas = $('#game')[0];
  var ctx = canvas.getContext('2d');

  var unit = 50;

  rotateAndDrawFigure(0, 4, {x: unit, y: unit}, '#95ffa5');
  rotateAndDrawFigure(90, 2, {x: unit * 5, y: unit * 3}, 'red');
  rotateAndDrawFigure(0, 1, {x: unit * 3, y: unit * 5}, '#95ffa5');

  function drawFigure(fgrNmb, coords, color) {
    var figures = [
      // 3x1 line
      [
        {x: coords.x, y: coords.y, length: unit, color: color},
        {x: coords.x + unit, y: coords.y, length: unit, color: color},
        {x: coords.x + unit * 2, y: coords.y, length: unit, color: color}
      ],
      // 2x2 square
      [
        {x: coords.x, y: coords.y, length: unit, color: color},
        {x: coords.x + unit, y: coords.y, length: unit, color: color},
        {x: coords.x, y: coords.y + unit, length: unit, color: color},
        {x: coords.x + unit, y: coords.y + unit, length: unit, color: color}
      ],
      // 3x1 line and 1 on end down
      [
        {x: coords.x, y: coords.y, length: unit, color: color},
        {x: coords.x + unit, y: coords.y, length: unit, color: color},
        {x: coords.x + unit * 2, y: coords.y, length: unit, color: color},
        {x: coords.x + unit * 2, y: coords.y + unit, length: unit, color: color},
      ],
      // 3x1 line and 1 on beginning down
      [
        {x: coords.x, y: coords.y, length: unit, color: color},
        {x: coords.x + unit, y: coords.y, length: unit, color: color},
        {x: coords.x + unit * 2, y: coords.y, length: unit, color: color},
        {x: coords.x, y: coords.y + unit, length: unit, color: color},
      ],
      // 3x1 line and 1 on in middle down
      [
        {x: coords.x, y: coords.y, length: unit, color: color},
        {x: coords.x + unit, y: coords.y, length: unit, color: color},
        {x: coords.x + unit * 2, y: coords.y, length: unit, color: color},
        {x: coords.x + unit, y: coords.y + unit, length: unit, color: color},
      ],
      // 2x2 square and on end down
      [
        {x: coords.x, y: coords.y, length: unit, color: color},
        {x: coords.x + unit, y: coords.y, length: unit, color: color},
        {x: coords.x, y: coords.y + unit, length: unit, color: color},
        {x: coords.x + unit, y: coords.y + unit, length: unit, color: color},
        {x: coords.x + unit, y: coords.y + unit * 2, length: unit, color: color}
      ],
      // 2x2 square and on beginning down
      [
        {x: coords.x, y: coords.y, length: unit, color: color},
        {x: coords.x + unit, y: coords.y, length: unit, color: color},
        {x: coords.x, y: coords.y + unit, length: unit, color: color},
        {x: coords.x + unit, y: coords.y + unit, length: unit, color: color},
        {x: coords.x, y: coords.y + unit * 2, length: unit, color: color}
      ]
    ];

    drawSquare(figures[fgrNmb]);
  }

  function rotateAndDrawFigure(deg, fgrNmb, coords, color) {
    ctx.translate(((coords.x + 3 * unit) - coords.x) / 2 + coords.x, ((coords.y + 3 * unit) - coords.y) / 2 + coords.y);
    ctx.rotate(deg * Math.PI / 180);
    ctx.translate(-(((coords.x + 3 * unit) - coords.x) / 2 + coords.x), -(((coords.y + 3 * unit) - coords.y) / 2 + coords.y));
    drawFigure(fgrNmb, coords, color);
    ctx.translate(((coords.x + 3 * unit) - coords.x) / 2 + coords.x, ((coords.y + 3 * unit) - coords.y) / 2 + coords.y);
    ctx.rotate((360 - deg) * Math.PI / 180);
    ctx.translate(-(((coords.x + 3 * unit) - coords.x) / 2 + coords.x), -(((coords.y + 3 * unit) - coords.y) / 2 + coords.y));
  }

  function drawSquare(sqr) {
    if (sqr.constructor === Array) {
      sqr.forEach(function (oneSqr) {
        drawRect({
          x: oneSqr.x,
          y: oneSqr.y,
          width: oneSqr.length,
          height: oneSqr.length,
          color: oneSqr.color
        });
      });
      return;
    }

    drawRect({
      x: sqr.x,
      y: sqr.y,
      width: sqr.length,
      height: sqr.length,
      color: sqr.color
    });
  }

  function drawRect(rect) {
    if (rect.constructor === Array) {
      rect.forEach(function (oneRect) {
        ctx.fillStyle = oneRect.color;
        ctx.fillRect(oneRect.x, oneRect.y, oneRect.width, oneRect.height);
      });
      return;
    }

    ctx.fillStyle = rect.color;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }
});