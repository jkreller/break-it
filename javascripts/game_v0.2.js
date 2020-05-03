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
    radius: (canvas.width + canvas.height) / 150,
    dx: 5,
    dy: -5
  };

  ball.x = canvas.width / 2;
  ball.y = canvas.height - paddle.height - ball.radius - 1;

  var bricksData = {
    rowCount: 3,
    columnCount: 10,
    padding: canvas.width / 50,
    offsetTop: canvas.width / 50,
    offsetSides: canvas.width / 50,
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

    if (paddle.x <= 0) {
      paddle.x = 0;
    } else if (paddle.x + paddle.width >= canvas.width) {
      paddle.x = canvas.width - paddle.width;
    }

    if (ballLeft > paddle.x && ballRight < paddle.x + paddle.width && ballBottom > paddle.y) {
      ball.y = paddle.y - ball.radius;
      ball.dy = -ball.dy;
    } else if ((ball.y > paddle.y && ball.y < paddle.y + paddle.height) && ((ballRight > paddle.x && ballLeft < paddle.x + paddle.width))) {
      if (ballRight >= paddle.x && ballRight <= paddle.x + paddle.width) {
        ball.x = paddle.x - ball.radius;
      } else {
        ball.x = paddle.x + paddle.width + ball.radius;
      }
      ball.dx = -ball.dx;
    }

    drawBricks();

    var emptyColumns = 0;
    bricks.forEach(function (column) {
      column.forEach(function (brick, brickIndex) {
        if ((ball.x >= brick.x && ball.x <= brick.x + bricksData.brickWidth) && ((ballUp <= brick.y + bricksData.brickHeight && ballBottom >= brick.y))) {
          ball.dy = -ball.dy;
          column.splice(brickIndex, 1);
        } else if ((ball.y >= brick.y && ball.y <= brick.y + bricksData.brickHeight) && ((ballRight >= brick.x && ballLeft <= brick.x + bricksData.brickWidth))) {
          ball.dx = -ball.dx;
          column.splice(brickIndex, 1);
        }
      });

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