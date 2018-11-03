const snakeGame = () => {
  const canvas = document.createElement("canvas");
  if (canvas.getContext) {
    const primaryCanvas = document.getElementById("primaryCanvas");
    const secondaryCanvas = document.getElementById("secondaryCanvas");

    // GLOBAL VARIABLES
    const primary = primaryCanvas.getContext("2d");
    const secondary = secondaryCanvas.getContext("2d");
    const HEIGHT = primaryCanvas.height;
    const WIDTH = primaryCanvas.width;

    let tick;
    let currentApple;
    let currentInterval;
    let score = 0;

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
        left: ["ArrowLeft", "a", 37, 65],
        up: ["ArrowUp", "w", 38, 87],
        right: ["ArrowRight", "d", 39, 68],
        down: ["ArrowDown", "s", 40, 83]
      },
      startDirection: "RIGHT",
      updateScore: () => {
        score += 10;
      },
      updateVelocity: () => {
        currentInterval -= (currentInterval / 100) * 3;
      },
      TILESIZE: 20
    };

    const {
      appleFill,
      snakeFill,
      snakeInitialState,
      initialInterval,
      controls,
      startDirection,
      updateScore,
      updateVelocity,
      TILESIZE
    } = config;

    const LIMIT_X = WIDTH / TILESIZE - 1;
    const LIMIT_Y = HEIGHT / TILESIZE - 1;
    const GRIDSIZE_X = WIDTH / TILESIZE;
    const GRIDSIZE_Y = HEIGHT / TILESIZE;

    // HELPERS
    const getRandom = (min, max) => {
      return Math.floor(Math.random() * (max - min) + min);
    };
    // "candidate input is very hairy and needs to be refactored (in 2 of 3 cases they are actually separate coords, not an object.)"
    const isMatch = (candidate, current) => {
      let { posX: x, posY: y } = candidate;
      if (Array.isArray(current)) {
        let match = current.filter(item => item.posX === x && item.posY === y);
        return !!match.length;
      } else {
        // currentApple is not an array
        return x === current.posX && y === current.posY;
      }
    };

    const drawRectangle = (posX, posY, dim = TILESIZE, fill) => {
      primary.fillStyle = fill;
      primary.fillRect(posX * TILESIZE, posY * TILESIZE, dim, dim);
    };

    const clearRectangle = (posX, posY, dim = TILESIZE) => {
      primary.clearRect(posX * TILESIZE, posY * TILESIZE, dim, dim);
    };

    const spawnApple = () => {
      currentApple = null;
      currentApple = new Apple();
      currentApple.render();
    };

    detectCollision = function(x, y, context) {
      if (
        x < 0 ||
        y < 0 ||
        x > LIMIT_X ||
        y > LIMIT_Y ||
        isMatch({ posX: x, posY: y }, context.shape)
      ) {
        return true;
      }
    };

    const playSound = (sound, volume = 0.1) => {
      const audio = document.getElementById(sound);
      if (audio) {
        audio.volume = volume;
        audio.currentTime = 0;
        audio.play();
      }
    };

    const repaintScore = () => {
      secondary.clearRect(0, 0, secondaryCanvas.width, secondaryCanvas.height);
      secondary.textAlign = "right";
      secondary.fillStyle = "white";
      secondary.font = "bold 24px monospace";
      secondary.fillText(
        `score: ${String(score).padStart(3, " ")}`,
        secondaryCanvas.width,
        50
      );
    };

    // CONTROLS
    controlDirection = e => {
      if (!snake) return;
      const { left, up, right, down } = controls;
      key = e.key || e.keyIdentifier || e.keyCode;
      switch (true) {
        case !!~left.indexOf(key) && snake.direction !== "RIGHT":
          snake.setDirection("LEFT").move();
          break;
        case !!~up.indexOf(key) && snake.direction !== "DOWN":
          snake.setDirection("UP").move();
          break;
        case !!~right.indexOf(key) && snake.direction !== "LEFT":
          snake.setDirection("RIGHT").move();
          break;
        case !!~down.indexOf(key) && snake.direction !== "UP":
          snake.setDirection("DOWN").move();
          break;
      }
    };

    // CONSTRUCTORS
    const Tile = function(posX, posY) {
      this.posX = posX;
      this.posY = posY;
    };

    const Apple = function() {
      [this.posX, this.posY] = this.getFreeCoords();
    };

    Apple.prototype.getFreeCoords = function() {
      const getMatches = function() {
        let randX = getRandom(0, GRIDSIZE_X);
        let randY = getRandom(0, GRIDSIZE_Y);
        if (isMatch({ posX: randX, posY: randY }, snake.shape)) {
          return getMatches();
        }
        return [randX, randY];
      };
      return getMatches();
    };

    Apple.prototype.render = function() {
      drawRectangle(this.posX, this.posY, TILESIZE, appleFill);
    };

    const Snake = function() {
      this.shape = snakeInitialState.map(item => new Tile(item.x, item.y));
      this.direction = startDirection;

      this.init = function() {
        console.log("snake initialized!");
        window.addEventListener(
          "keydown",
          e => {
            // bind this?
            controlDirection(e);
          },
          false
        );
        for (let item of this.shape) {
          drawRectangle(item.posX, item.posY, TILESIZE, snakeFill);
        }
        spawnApple();
        currentInterval = initialInterval;
        tick = setInterval(this.move.bind(this), currentInterval);
      };

      this.setDirection = function(direction) {
        this.direction = direction;
        return this;
      };

      this.move = function() {
        let { posX: newX, posY: newY } = this.shape[0];
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
        this.redraw(newX, newY);
      };

      this.redraw = function(x, y) {
        const tileToAdd = new Tile(x, y);
        const isCollision = detectCollision(
          tileToAdd.posX,
          tileToAdd.posY,
          this
        );
        if (isCollision) {
          // snake does crash to itself or to the edges of canvas
          playSound("snake_crash");
          clearInterval(tick);
          snake = null;
        } else {
          this.shape.unshift(tileToAdd);
          drawRectangle(tileToAdd.posX, tileToAdd.posY, TILESIZE, snakeFill);
          if (isMatch(tileToAdd, currentApple)) {
            // snake eats an apple
            playSound("snake_apple-eaten");
            // TODO Merge update and repaint score into one function
            updateScore();
            repaintScore();
            updateVelocity();
            spawnApple();
          } else {
            const tileToRemove = this.shape.pop();
            clearRectangle(tileToRemove.posX, tileToRemove.posY, TILESIZE);
          }
        }
      };
    };

    let snake = new Snake();
    snake.init();
  }
};

window.addEventListener("load", () => snakeGame(), false);
