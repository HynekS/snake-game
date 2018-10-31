const draw = () => {
  const myCanvas = document.getElementById("myCanvas");

  if (myCanvas.getContext) {
    // GLOBAL VARIABLES
    const ctx = myCanvas.getContext("2d");
    const HEIGHT = myCanvas.height;
    const WIDTH = myCanvas.width;

    let tick;
    let currentApple;
    let currentInterval;

    // CONFIG
    const config = {
      appleFill: "rgb(250, 0, 0)",
      snakeFill: "rgb(0, 0, 0)",
      snakeInitialState: [
        { x: 4, y: 9 },
        { x: 3, y: 9 },
        { x: 2, y: 9 },
        { x: 1, y: 9 }
      ],
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

    const {
      appleFill,
      snakeFill,
      snakeInitialState,
      initialInterval,
      controls,
      startDirection,
      TILESIZE
    } = config;

    const LIMIT_X = WIDTH / TILESIZE - 1;
    const LIMIT_Y = HEIGHT / TILESIZE - 1;

    // HELPERS
    const getRandom = (min, max) => {
      return Math.floor(Math.random() * (max - min) + min);
    };

    const drawRectangle = (posX, posY, dim = TILESIZE, fill) => {
      ctx.fillStyle = fill;
      ctx.fillRect(posX * TILESIZE, posY * TILESIZE, dim, dim);
    };

    const clearRectangle = (posX, posY, dim = TILESIZE) => {
      ctx.clearRect(posX * TILESIZE, posY * TILESIZE, dim, dim);
    };

    const playSound = (sound, volume = 0.1) => {
      const audio = document.getElementById(sound);
      if (audio) {
        audio.volume = volume;
        audio.currentTime = 0;
        audio.play();
      }
    };

    // CONTROLS
    controlDirection = e => {
      const { left, up, right, down } = controls;
      key = e.key || e.keyIdentifier || e.keyCode;
      switch (snake && true) {
        case !!~left.indexOf(key) && snake.direction !== "RIGHT":
          snake.setDirection("LEFT").moveSnake();
          break;
        case !!~up.indexOf(key) && snake.direction !== "DOWN":
          snake.setDirection("UP").moveSnake();
          break;
        case !!~right.indexOf(key) && snake.direction !== "LEFT":
          snake.setDirection("RIGHT").moveSnake();
          break;
        case !!~down.indexOf(key) && snake.direction !== "UP":
          snake.setDirection("DOWN").moveSnake();
          break;
      }
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
        let match = snake.snakeBody.filter(
          item => item.topX === randX && item.topY === randY
        );
        if (match.length) {
          return getMatches();
        }
        return [randX, randY];
      };
      return getMatches();
    };

    Apple.prototype.drawApple = function() {
      drawRectangle(this.topX, this.topY, TILESIZE, appleFill);
    };

    const Snake = function() {
      this.snakeBody = snakeInitialState.map(item => new Tile(item.x, item.y));
      this.direction = startDirection;

      this.initSnake = function() {
        console.log("snake initialized!");
        window.addEventListener(
          "keydown",
          e => {
            // bind this?
            controlDirection(e);
          },
          false
        );
        for (let item of this.snakeBody) {
          drawRectangle(item.topX, item.topY, TILESIZE, snakeFill);
        }
        spawnApple();
        currentInterval = initialInterval;
        tick = setInterval(this.moveSnake.bind(this), currentInterval);
      };

      this.setDirection = function(direction) {
        this.direction = direction;
        return this;
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
        const isCollision = detectCollision(
          tileToAdd.topX,
          tileToAdd.topY,
          this
        );
        if (isCollision) {
          playSound("snake_crash");
          clearInterval(tick);
          //alert("GAME OVER, YOU SUCKER!");
        } else {
          this.snakeBody.unshift(tileToAdd);
          drawRectangle(tileToAdd.topX, tileToAdd.topY, TILESIZE, snakeFill);
          if (
            tileToAdd.topX === currentApple.topX &&
            tileToAdd.topY === currentApple.topY
          ) {
            playSound("snake_apple-eaten");
            currentInterval -= (currentInterval / 100) * 3;
            spawnApple();
          } else {
            const tileToRemove = this.snakeBody.pop();
            clearRectangle(tileToRemove.topX, tileToRemove.topY, TILESIZE);
          }
        }
      };
    };

    this.spawnApple = function() {
      currentApple = null;
      currentApple = new Apple();
      currentApple.drawApple();
    };

    this.detectCollision = function(x, y, context) {
      let match = context.snakeBody.filter(
        item => item.topX === x && item.topY === y
      );
      if (x < 0 || y < 0 || x > LIMIT_X || y > LIMIT_Y || match.length) {
        return true;
      }
    };

    const snake = new Snake();
    snake.initSnake();
  }
};

window.addEventListener("load", () => draw(), false);

// Attempt to make one function for all match / collision detection (not tested yet):
//
// const isMatch = (candidate, current) => {
//   let { topX: x, topY: y } = candidate;
//   if(!Array.isArray(current)) current = [...current];
//   let match = current.filter(item => item.topX === x && item.topY === y);
//   return !!match.length;
// }
