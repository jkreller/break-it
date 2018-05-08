$(function () {
  var canvas = $('#game')[0];
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx = canvas.getContext('2d');

  $(document).keydown(keyDownHandler);
  $(document).keyup(keyUpHandler);

  var interval = setInterval(draw, 10);

  var paddle = {
    width: canvas.width / 10,
    height: canvas.height / 30,
    dx: 10,
    goLeft: false,
    goRight: false
  };

  paddle.x = canvas.width / 2 - paddle.width / 2;
  paddle.y = canvas.height - paddle.height;

  var ball = {
    radius: 12,
    dx: 2,
    dy: -2
  };

  ball.x = canvas.width / 2;
  ball.y = canvas.height - paddle.height - ball.radius - 1;

  var bricksData = {
    rowCount: 10,
    columnCount: 25,
    padding: 10,
    offsetTop: 10,
    offsetSides: 10,
    brickHeight: canvas.height / 20
  };

  bricksData.brickWidth = (canvas.width - 2 * bricksData.offsetSides) / bricksData.columnCount - bricksData.padding;

  var bricks = [];

  for (var i = 0; i < bricksData.columnCount; i++) {
    bricks[i] = [];
    for (var j = 0; j < bricksData.rowCount; j++) {
      bricks[i][j] = {
        x: bricksData.offsetSides + i * bricksData.brickWidth + bricksData.padding * i,
        y: bricksData.offsetTop + j * bricksData.brickHeight + bricksData.padding * j
      };
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBall();

    var ballLeft = ball.x - ball.radius;
    var ballRight = ball.x + ball.radius;
    var ballUp = ball.y - ball.radius;
    var ballBottom = ball.y + ball.radius;

    if (ballBottom >= canvas.height - paddle.height && ballLeft >= paddle.x && ballRight <= paddle.x + paddle.width) {
      ball.dy = -ball.dy;
    }

    if (ballLeft <= 0 || ballRight >= canvas.width) {
      ball.dx = -ball.dx;
    } else if (ballUp <= 0) {
      ball.dy = -ball.dy;
    } else if (ballBottom >= canvas.height) {
      alert('GAME OVER!');
      location.reload();
      clearInterval(interval);
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    drawPaddle();

    if (paddle.goLeft) {
      paddle.x -= paddle.dx;
    } else if (paddle.goRight) {
      paddle.x += paddle.dx;
    }

    drawBricks();

    var emptyColumns = 0;
    bricks.forEach(function (column) {
      var firstBrick = column[0];
      var lastBrick = column[column.length - 1];

      if ((firstBrick && lastBrick) && (ballLeft >= firstBrick.x && ballRight <= firstBrick.x + bricksData.brickWidth && ballUp <= lastBrick.y + bricksData.brickHeight)) {
        column.pop();
        ball.dy = -ball.dy;
      }

      if (column.length === 0) {
        emptyColumns++;
      }
    });

    if (emptyColumns === bricksData.columnCount) {
      alert('You won!');
      location.reload();
      clearInterval(interval);
    }
  }

  function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = '#9de0ff';
    ctx.fill();
    ctx.closePath();
  }

  function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = '#9de0ff';
    ctx.fill();
    ctx.closePath();
  }

  function drawBricks() {
    bricks.forEach(function (column) {
      column.forEach(function (brick) {
        ctx.beginPath();
        ctx.rect(brick.x, brick.y, bricksData.brickWidth, bricksData.brickHeight);
        ctx.fillStyle = '#9de0ff';
        ctx.fill();
        ctx.closePath();
      });
    });
  }

  function keyDownHandler(event) {
    if (event.key === 'ArrowLeft') {
      paddle.goLeft = true;
    } else if (event.key === 'ArrowRight') {
      paddle.goRight = true;
    }
  }

  function keyUpHandler(event) {
    if (event.key === 'ArrowLeft') {
      paddle.goLeft = false;
    } else if (event.key === 'ArrowRight') {
      paddle.goRight = false;
    }
  }
});