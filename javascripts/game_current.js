$(function () {
  var canvas = $('#game')[0];
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx = canvas.getContext('2d');

  $(document).keydown(keyDownHandler);
  $(document).keyup(keyUpHandler);
  $(canvas).click(clickHandler);

  var sounds = {
    blub: new Audio('assets/blub.mp3')
  };

  var continueAnimating = true;
  var startActive = true;
  var startLevelActive = false;
  var levelCount = 2;

  var playerStats = {
    score: 0,
    allowedDeaths: 3,
    deaths: 0,
    currentLevel: 1
  };

  var paddle = {
    width: canvas.width / 10,
    height: canvas.height / 30,
    dx: 15,
    goLeft: false,
    goRight: false,
    color: '#fff'
  };

  paddle.startPosition = {
    x: canvas.width / 2 - paddle.width / 2,
    y: canvas.height - paddle.height
  };

  var ball = {
    radius: (canvas.width + canvas.height) / 150,
    startMovement: {
      dx: 8,
      dy: -8
    },
    color: '#99ff8c'
  };

  ball.startPosition = {
    x: canvas.width / 2,
    y: canvas.height - paddle.height - ball.radius - 1
  };

  resetMovements();

  var bricksData = {};
  var bricks = [];

  var restartButton = {
    width: canvas.width / 8,
    height: canvas.height / 20,
    color: '#fff',
    fontColor: '#000'
  };

  restartButton.x = canvas.width / 2 - restartButton.width / 2;
  restartButton.y = canvas.height * (4 / 7);
  restartButton.fontSize = restartButton.height * (3 / 4);

  function draw() {
    if (!continueAnimating) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (startLevelActive) {
      fillBricksArray(playerStats.currentLevel);
    }

    if (startActive) {
      drawStart();
      return;
    }

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
      playerStats.deaths++;
      resetMovements();
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    drawPaddle();

    // paddle movement
    if (paddle.goLeft) {
      paddle.x -= paddle.dx;
    } else if (paddle.goRight) {
      paddle.x += paddle.dx;
    }

    // paddle movement borders on end of canvas
    if (paddle.x <= 0) {
      paddle.x = 0;
    } else if (paddle.x + paddle.width >= canvas.width) {
      paddle.x = canvas.width - paddle.width;
    }

    // collision of ball and paddle
    if (ball.x > paddle.x && ball.x < paddle.x + paddle.width && ballBottom > paddle.y) { //if collides on top
      ball.y = paddle.y - ball.radius;
      ball.dy = -ball.dy;
      ball.dx = ball.startMovement.dx * ((ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2));
    } else if ((ball.y > paddle.y && ball.y < paddle.y + paddle.height) && ((ballRight > paddle.x && ballLeft < paddle.x + paddle.width))) { // if collides on sides
      if (ballRight >= paddle.x && ballRight <= paddle.x + paddle.width) { // if collides on left side
        ball.x = paddle.x - ball.radius;
      } else { // if collides on right side
        ball.x = paddle.x + paddle.width + ball.radius;
      }
      ball.dx = -ball.dx;
    }

    drawBricks();

    var emptyColumns = 0;
    bricks.forEach(function (column) {
      column.forEach(function (brick, brickIndex) {
        if ((ball.x >= brick.x && ball.x <= brick.x + bricksData.brickWidth) && ((ballUp <= brick.y + bricksData.brickHeight && ballBottom >= brick.y))) {
          playerStats.score++;
          ball.dy = -ball.dy;
          column.splice(brickIndex, 1);
          //sounds.blub.play();
        } else if ((ball.y >= brick.y && ball.y <= brick.y + bricksData.brickHeight) && ((ballRight >= brick.x && ballLeft <= brick.x + bricksData.brickWidth))) {
          playerStats.score++;
          ball.dx = -ball.dx;
          column.splice(brickIndex, 1);
          //sounds.blub.play();
        }
      });

      if (column.length === 0) {
        emptyColumns++;
      }
    });

    // if player won level
    if (emptyColumns === bricksData.columnCount) {
      if (levelCount === playerStats.currentLevel) {
        drawWin();
        continueAnimating = false;
      } else {
        resetMovements();
        resetStats();
        startLevelActive = true;
        playerStats.currentLevel++;
      }
    }

    drawPlayerStats();

    if (playerStats.deaths > playerStats.allowedDeaths) {
      drawGameOver();
      continueAnimating = false;
    }

    if (startLevelActive) {
      if (!startActive) {
        continueAnimating = false;
        drawLevelText();
      }
      startLevelActive = false;
    }

    requestAnimationFrame(draw);
  }

  function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
  }

  function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = paddle.color;
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

  function drawPlayerStats() {
    ctx.beginPath();
    ctx.fillStyle = '#ffffff';
    ctx.font = bricksData.offsetTop - bricksData.offsetTop / 2 + 'px "Open Sans"';
    ctx.textAlign = 'left';
    ctx.fillText('Bricks left: ' + (bricksData.bricksCount - playerStats.score) + '/' + bricksData.bricksCount, bricksData.offsetSides / 2, bricksData.offsetTop - bricksData.offsetTop / 3);
    ctx.textAlign = 'right';
    ctx.fillText('Deaths left: ' + (playerStats.allowedDeaths - playerStats.deaths) + '/' + playerStats.allowedDeaths, canvas.width - bricksData.offsetSides / 2, bricksData.offsetTop - bricksData.offsetTop / 3);
    ctx.closePath();
  }

  function drawStart() {
    drawTransparentBackground();

    ctx.font = 'lighter ' + canvas.width / 15 + 'px "Open Sans"';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText('Break It!', canvas.width / 2, canvas.height / 2);
    ctx.closePath();

    drawStartButton();
  }

  function drawStartButton() {
    ctx.beginPath();
    ctx.rect(restartButton.x, restartButton.y, restartButton.width, restartButton.height);
    ctx.fillStyle = restartButton.color;
    ctx.fill();

    ctx.fillStyle = restartButton.fontColor;
    ctx.font = restartButton.fontSize + 'px "Open Sans"';
    ctx.textAlign = 'center';
    ctx.fillText('Start', canvas.width / 2, restartButton.y + restartButton.fontSize);
    ctx.closePath();
  }

  function drawCountDown(countDownStart) {
    var i = countDownStart;
    var number = {
      x: canvas.width / 2,
      y: canvas.height / 2 + canvas.width / 10,
      height: canvas.width / 15
    };

    number.topLeftX = number.x - number.height / 2;
    number.topLeftY = number.y - number.height;

    function countDownLoop() {
      ctx.beginPath();

      if (i !== countDownStart) {
        ctx.rect(number.topLeftX, number.topLeftY, number.height, number.height + 5);
        ctx.fillStyle = 'rgba(0, 0, 0, .5)';
        ctx.fill();
      }

      ctx.font = 'lighter ' + number.height + 'px "Open Sans"';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText(i, number.x, number.y);
      ctx.closePath();
      setTimeout(function () {
        ctx.clearRect(number.topLeftX, number.topLeftY, number.height, number.height + 5);
        i--;
        if (i > 0) {
          countDownLoop();
        }
      }, 1000)
    }

    countDownLoop();
  }

  function drawWin() {
    drawTransparentBackground();

    ctx.font = 'lighter ' + canvas.width / 15 + 'px "Open Sans"';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText('You won!', canvas.width / 2, canvas.height / 2);
    ctx.closePath();

    drawRestartButton();
  }

  function drawLevelText() {
    drawTransparentBackground();

    ctx.font = 'lighter ' + canvas.width / 15 + 'px "Open Sans"';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText('Level ' + playerStats.currentLevel, canvas.width / 2, canvas.height / 2);
    ctx.closePath();

    drawCountDown(3);

    setTimeout(function () {
      continueAnimating = true;
      draw();
    }, 3000);
  }

  function drawGameOver() {
    drawTransparentBackground();

    ctx.font = 'lighter ' + canvas.width / 15 + 'px "Open Sans"';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
    ctx.closePath();

    drawRestartButton();
  }

  function drawRestartButton() {
    ctx.beginPath();
    ctx.rect(restartButton.x, restartButton.y, restartButton.width, restartButton.height);
    ctx.fillStyle = restartButton.color;
    ctx.fill();

    ctx.fillStyle = restartButton.fontColor;
    ctx.font = restartButton.fontSize + 'px "Open Sans"';
    ctx.textAlign = 'center';
    ctx.fillText('Restart', canvas.width / 2, restartButton.y + restartButton.fontSize);
    ctx.closePath();
  }

  function drawTransparentBackground() {
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, .5)';
    ctx.fill();
  }

  function resetMovements() {
    paddle.x = paddle.startPosition.x;
    paddle.y = paddle.startPosition.y;

    ball.x = ball.startPosition.x;
    ball.y = ball.startPosition.y;
    ball.dx = ball.startMovement.dx;
    ball.dy = ball.startMovement.dy;
  }

  function resetStats() {
    playerStats.score = 0;
    playerStats.allowedDeaths = 3;
    playerStats.deaths = 0;
  }

  function fillBricksArray(level) {
    bricksData = {
      padding: canvas.width / 50,
      offsetTop: canvas.width / 30,
      offsetSides: canvas.width / 50,
      brickHeight: canvas.height / 20,
      bricksCount: 0
    };

    var emptyBricks = [];

    switch (level) {
      case 1:
        bricksData.rowCount = 1;
        bricksData.columnCount = 2;
        break;
      case 2:
        bricksData.rowCount = 3;
        bricksData.columnCount = 5;

        emptyBricks.push({
          columnIndex: 1,
          rowIndex: [1]
        });

        emptyBricks.push({
          columnIndex: 2,
          rowIndex: [1]
        });

        emptyBricks.push({
          columnIndex: 3,
          rowIndex: [1]
        });
        break;
    }

    bricksData.brickWidth = (canvas.width - 2 * bricksData.offsetSides) / bricksData.columnCount - bricksData.padding;

    for (var i = 0; i < bricksData.columnCount; i++) {
      bricks[i] = [];

      var emptyRows = [];
      emptyBricks.forEach(function (column) {
        if (column.columnIndex === i) {
          emptyRows = column.rowIndex;
        }
      });

      for (var j = 0; j < bricksData.rowCount; j++) {
        if (!emptyRows.includes(j)) {
          bricks[i][j] = {
            x: bricksData.offsetSides + i * bricksData.brickWidth + bricksData.padding * i,
            y: bricksData.offsetTop + j * bricksData.brickHeight + bricksData.padding * j
          };

          bricksData.bricksCount++;
        }
      }
    }
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

  function clickHandler(event) {
    var clickCanvasX = event.pageX - canvas.offsetLeft;
    var clickCanvasY = event.pageY - canvas.offsetTop;

    // restart button
    if (clickCanvasX >= restartButton.x && clickCanvasX <= restartButton.x + restartButton.width && clickCanvasY >= restartButton.y && clickCanvasY <= restartButton.y + restartButton.height) {
      if (!continueAnimating && !startActive) {
        location.reload();
      } else if (startActive) {
        startActive = false;
        startLevelActive = true;
        draw();
      }
    }
  }

  draw();
});