const draw = () => {
  const myCanvas = document.getElementById("myCanvas");

  if (myCanvas.getContext) {
    // GLOBAL VARIABLES
    let ctx = myCanvas.getContext("2d");
    let tick;
    let currentApple;
    let currentInterval;
    const HEIGHT = myCanvas.height;
    const WIDTH = myCanvas.width;

    // CONFIG
    const config = {
      appleFill: "rgb(250, 0, 0)",
      snakeFill: "rgb(0, 0, 0)",
      initialState: [{ x: 3, y: 9 }, { x: 2, y: 9 }, { x: 1, y: 9 }],
      initialInterval: 200,
      controls: {
        left: ["ArrowLeft", 37],
        up: ["ArrowUp", 38],
        right: ["ArrowRight", 39],
        down: ["ArrowDown", 40]
      },
      startDirection: "RIGHT",
      TILESIZE: 20
    };

    const LIMIT_X = WIDTH / config.TILESIZE - 1;
    const LIMIT_Y = HEIGHT / config.TILESIZE - 1;

    // HELPERS
    const getRandom = (min, max) => {
      return Math.floor(Math.random() * (max - min) + min);
    };

    const drawRectangle = (posX, posY, dim = config.TILESIZE, fill) => {
      ctx.fillStyle = fill;
      ctx.fillRect(posX * config.TILESIZE, posY * config.TILESIZE, dim, dim);
    };

    const clearRectangle = (posX, posY, dim = config.TILESIZE) => {
      ctx.clearRect(posX * config.TILESIZE, posY * config.TILESIZE, dim, dim);
    };

    // CONSTRUCTORS
    const Tile = function(topX, topY) {
      this.topX = topX;
      this.topY = topY;
    };

    const Apple = function() {
      [this.topX, this.topY] = this.getFreeCoords();
    };

    Apple.prototype.getFreeCoords = function() {
      const getMatches = function() {
        let randX = getRandom(0, 20);
        let randY = getRandom(0, 20);
        let matchX = snake.snakeBody.filter(item => item.topX == randX);
        let matchY = snake.snakeBody.filter(item => item.topY == randY);

        if (matchX.length && matchY.length) {
          return getMatches();
        }
        return [randX, randY];
      };
      return getMatches();
    };

    Apple.prototype.drawApple = function() {
      drawRectangle(this.topX, this.topY, config.TILESIZE, config.appleFill);
    };

    controlDirection = function(e) {
      const { left, up, right, down } = config.controls;
      key = e.key || e.keyIdentifier || e.keyCode;
      switch (snake && true) {
        case !!~left.indexOf(key) && snake.direction !== "RIGHT":
          snake.setDirection("LEFT");
          snake.moveSnake();
          break;
        case !!~up.indexOf(key) && snake.direction !== "DOWN":
          snake.setDirection("UP");
          snake.moveSnake();
          break;
        case !!~right.indexOf(key) && snake.direction !== "LEFT":
          snake.setDirection("RIGHT");
          snake.moveSnake();
          break;
        case !!~down.indexOf(key) && snake.direction !== "UP":
          snake.setDirection("DOWN");
          snake.moveSnake();
          break;
      }
    };

    const Snake = function() {
      this.snakeBody = config.initialState.map(
        item => new Tile(item.x, item.y)
      );
      this.direction = config.startDirection;

      this.initSnake = function() {
        console.log("snake initialized!");
        window.addEventListener(
          "keydown",
          e => {
            controlDirection(e);
          },
          false
        );
        for (let item of this.snakeBody) {
          drawRectangle(
            item.topX,
            item.topY,
            config.TILESIZE,
            config.snakeFill
          );
        }
        this.createApple();
        currentInterval = config.initialInterval;
        tick = setInterval(this.moveSnake.bind(this), currentInterval);
      };

      this.setDirection = function(direction) {
        this.direction = direction;
      };

      this.moveSnake = function() {
        let { topX: newX, topY: newY } = this.snakeBody[0];
        switch (this.direction) {
          case "LEFT":
            newX -= 1;
            break;
          case "UP":
            newY -= 1;
            break;
          case "RIGHT":
            newX += 1;
            break;
          case "DOWN":
            newY += 1;
            break;
        }
        this.redrawSnake(newX, newY);
      };

      this.redrawSnake = function(x, y) {
        const tileToAdd = new Tile(x, y);

        // DETECT COLLISIONS. TODO refactor to avoid unneccessary checks
        let match = this.snakeBody.filter(
          item => item.topX === tileToAdd.topX && item.topY === tileToAdd.topY
        );
        if (
          tileToAdd.topX < 0 ||
          tileToAdd.topY < 0 ||
          tileToAdd.topX > LIMIT_X ||
          tileToAdd.topY > LIMIT_Y ||
          match.length
        ) {
          alert("GAME OVER, YOU SUCKER!");
          clearInterval(tick);
          // To do: reset everything
        } else {
          this.snakeBody.unshift(tileToAdd);
          drawRectangle(
            tileToAdd.topX,
            tileToAdd.topY,
            config.TILESIZE,
            config.snakeFill
          );
          if (
            tileToAdd.topX === currentApple.topX &&
            tileToAdd.topY === currentApple.topY
          ) {
            console.warn("apple was eaten! Yummy!");
            currentInterval -= (currentInterval / 100) * 3;
            this.createApple();
          } else {
            const tileToRemove = this.snakeBody.pop();
            clearRectangle(
              tileToRemove.topX,
              tileToRemove.topY,
              config.TILESIZE
            );
          }
        }
      };

      this.createApple = function() {
        currentApple = null;
        currentApple = new Apple();
        currentApple.drawApple();
      };

      this.detectCollision = function() {};
    };

    const snake = new Snake();
    snake.initSnake();
  }
};

window.addEventListener("load", () => draw(), false);
