const unitLength = 20;
const boxColor = [150, 100, 100];
const lifeCustomColor = [60, 116, 246]
const noLifeCustomColor = [255, 255, 255]
const strokeColor = 50;
let columns; /* To be determined by window width*/
let rows; /* To be determined by window height */
let currentBoard;
let nextBoard;
let slider;
let manualMode = false
let filledText = document.querySelector("#game-result")
let filledBox = 0
let mouseClicked = {}
let generateMode = ""
let slitherStatus = { markCoordinates: [0, 0], scores: 0, speed: 15, direction: "right", gameOver: false, recordUpdated: false }
let slitherMarkGen = false
let slitherArray = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]
let controlMode = { color: "normalMode", method: "mouse" }
let keyboardPoint = [0, 0]
let keyboardContinueOrPause = 0;
let manualBtn = document.querySelector('#manual-mode')
let rulesBtns = document.querySelectorAll(".rules")
let startBtn = document.querySelector("#start-game")
let stopBtn = document.querySelector("#stop-game")
let ruleDisplay = document.querySelector("#rule-control")
let modeSelectBtn = document.querySelector(".mode-select")
let colorModeSelectBtn = document.querySelector(".color-mode-select")
let controlModeSelectBtn = document.querySelector(".control-mode-select")
let patternSelectBtn = document.querySelector(".pattern-select")
let customStylePalette = document.querySelector("#custom-style")
let rule = { birthStart: 3, birthEnd: 3, survivalStart: 2, survivalEnd: 3, priority: 1, limitedBoundary: false, initialRandomState: true }

function setup() {
  // location.reload();
  /* Set the canvas to be under the element #canvas*/
  const canvas = createCanvas(windowWidth - 20, windowHeight - 220);
  canvas.parent(document.querySelector('#canvas'));
  slider = createSlider(1, 30, 15);
  slider.parent(document.querySelector('#slider'))
  slider.position(15, height - 5);
  slider.style('width', '200px');

  /*Calculate the number of columns and rows */
  columns = floor(width / unitLength);
  rows = floor(height / unitLength);
  // console.log("width", width)
  // console.log("height", height)
  // console.log("columns", columns)
  // console.log("rows", rows)

  /*Making both currentBoard and nextBoard 2-dimensional matrix that has (columns * rows) boxes. */
  currentBoard = [];
  nextBoard = [];

  for (let i = 0; i < columns; i++) {
    currentBoard[i] = [];
    nextBoard[i] = [];
  }

  init();  // Set the initial values of the currentBoard and nextBoard
}

function init() {
  // Now both currentBoard and nextBoard are array of array of undefined values.
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      currentBoard[i][j] = { filled: 0, neighbors: 0, surviveRound: 0 };
      nextBoard[i][j] = { filled: 0, neighbors: 0, surviveRound: 0 };
    }
  }
  resetStatus()
  if (generateMode == "generateSlither") {
    resetSlither()
  }
  loop();
  if (controlMode.method == "keyboard") {
    setManualModeTrue();
  }
}

function windowResized() {
  resizeCanvas(windowWidth - 20, windowHeight - 220);
  columns = floor(width / unitLength);
  rows = floor(height / unitLength);
  slider.position(0, height - 5);

  for (let i = 0; i < columns; i++) {
    currentBoard[i] = [];
    nextBoard[i] = [];
  }

  init()
}

function draw() {
  let val = slider.value();
  document.querySelector("#slider-label").innerText = `Speed: ${val}`

  if (generateMode == "generateSlither") {
    frameRate(slitherStatus.speed)
  } else {
    frameRate(val)
  }
  background(255);
  if (rule.priority === 0) {
    eval(generateMode)()
  } else {
    generateCustom()
    // console.log("rule", rule)
  }
  if (controlMode.color !== "customMode") {
    customStylePalette.style.display = "none"
  } else {
    customStylePalette.style.display = "block"

    document.querySelector("#life-color").addEventListener("input", (e) => {
      let lifeColor = e.target.value.slice(1)
      // console.log(lifeColor)
      lifeCustomColor[0] = unhex(lifeColor.slice(0, 2))
      lifeCustomColor[1] = unhex(lifeColor.slice(2, 4))
      lifeCustomColor[2] = unhex(lifeColor.slice(4))
      // console.log(lifeCustomColor)
    })

    document.querySelector("#no-life-color").addEventListener("input", (e) => {
      let noLifeColor = e.target.value.slice(1)
      // console.log(noLifeColor)
      noLifeCustomColor[0] = unhex(noLifeColor.slice(0, 2))
      noLifeCustomColor[1] = unhex(noLifeColor.slice(2, 4))
      noLifeCustomColor[2] = unhex(noLifeColor.slice(4))
      // console.log(noLifeCustomColor)
    })
  }

  // console.log(generateMode)
  // console.log(columns, rows)
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      if (rule.initialRandomState) {
        if (random(0, 1) > 0.9) {
          currentBoard[i][j].filled = 1
        } else {
          currentBoard[i][j].filled = 0
        }
      }
      if (currentBoard[i][j].filled == 1) {
        if (controlMode.color == "randomMode" || rule.initialRandomState) {
          fill(floor(random(0, 256)), floor(random(0, 256)), floor(random(0, 256)))
        } else if (controlMode.color == "normalMode") {
          fill(0)
        } else if (controlMode.color == "neighborMode") {
          fill(boxColor[0], (boxColor[1] * (currentBoard[i][j].neighbors + 10)) % 255, (boxColor[2] * (currentBoard[i][j].neighbors + 100)) % 255);
          // console.log(boxColor[0], (boxColor[1] * (currentBoard[i][j].neighbors + 10)) % 255, (boxColor[2] * (currentBoard[i][j].neighbors + 100)) % 255)
        } else if (controlMode.color == "darkenMode") {
          // console.log(currentBoard[i][j].surviveRound)
          fill(255, 100, 0, currentBoard[i][j].surviveRound)
        } else if (controlMode.color == "customMode") {
          fill(lifeCustomColor[0], lifeCustomColor[1], lifeCustomColor[2])
        }
      } else {
        if (controlMode.color == "customMode") {
          fill(noLifeCustomColor[0], noLifeCustomColor[1], noLifeCustomColor[2])
        } else {
          fill(255);
        }
      }
      stroke(strokeColor);
      rect(i * unitLength, j * unitLength, unitLength, unitLength);
    }
  }
}

function generateCustom() {
  //Loop over every single box on the board
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      // Count all living members in the Moore neighborhood(8 boxes surrounding)
      let neighbors = 0;
      for (let i of [-1, 0, 1]) {
        for (let j of [-1, 0, 1]) {
          if (rule.limitedBoundary) {
            if ((x == 0 && i == -1) || (x == columns - 1 && i == 1) || (y == 0 && j == -1) || (y == rows - 1 && j == 1)) {
              continue;
            }
          }
          if (i === 0 && j === 0) {
            // the cell itself is not its own neighbor
            continue;
          }
          // The modulo operator is crucial for wrapping on the edge
          neighbors += currentBoard[(x + i + columns) % columns][(y + j + rows) % rows].filled;
        }
      }
      let { birthStart, birthEnd, survivalStart, survivalEnd } = rule
      // Rules of Life
      if (currentBoard[x][y].filled == 1 && (neighbors < survivalStart || neighbors > survivalEnd)) {
        nextBoard[x][y].filled = 0;
      } else if (currentBoard[x][y].filled == 0 && !(neighbors < birthStart || neighbors > birthEnd)) {
        nextBoard[x][y].filled = 1;
      } else {
        nextBoard[x][y].filled = currentBoard[x][y].filled;
      }
      nextBoard[x][y].neighbors = neighbors
      if (nextBoard[x][y].filled == 1) {
        nextBoard[x][y].surviveRound += 1
      }
    }
  }

  // Swap the nextBoard to be the current Board
  [currentBoard, nextBoard] = [nextBoard, currentBoard];
}

function setManualModeTrue() {
  manualBtn.disabled = true
  manualMode = true
  manualBtn.innerText = "Manual Mode: True"
  noLoop()
}

function setManualModeFalse() {
  manualBtn.disabled = true
  manualMode = false
  manualBtn.innerText = "Manual Mode: False"
  loop()
}

function generateB3S012345678() {
  ruleDisplay.style.display = "none"
  if (!manualMode) {
    setManualModeTrue()
  }

  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      let neighbors = 0;
      for (let i of [-1, 0, 1]) {
        for (let j of [-1, 0, 1]) {
          if (i === 0 && j === 0) {
            continue;
          }
          neighbors += currentBoard[(x + i + columns) % columns][(y + j + rows) % rows].filled;
        }
      }

      // Rules of Life
      if (currentBoard[x][y].filled == 0 && neighbors == 3) {
        nextBoard[x][y].filled = 1;
        filledBox += 1;
      } else {
        nextBoard[x][y].filled = currentBoard[x][y].filled;
      }
      nextBoard[x][y].neighbors = neighbors
      if (nextBoard[x][y].filled == 1) {
        nextBoard[x][y].surviveRound += 1
      }
    }
  }

  // Swap the nextBoard to be the current Board
  [currentBoard, nextBoard] = [nextBoard, currentBoard];
  let mouseClickedRecords = Object.values(mouseClicked)

  filledText.innerText = `Mouse clicked ${mouseClickedRecords.length} boxes, ${filledBox} filled in total ${rows * columns} boxes = ${(filledBox * 100 / (rows * columns)).toFixed(2)}%`
}

function generateB3S23() {
  ruleUpdate(3, 3, 2, 3)
  generateCustom()
}

function generateB25S4() {
  ruleUpdate(2, 5, 4, 4)
  generateCustom()
}

function resetStatus() {
  startBtn.disabled = false
  stopBtn.disabled = false
  manualBtn.disabled = false

  filledText.innerText = ""
  ruleDisplay.style.display = "block"

  filledBox = 0
  mouseClicked = {}

  rule.limitedBoundary = false
  keyboardContinueOrPause = 0
}


function resetMouseMethod() {
  controlModeSelectBtn.selectedIndex = "1"
  controlMode.method = "mouse"
  keyboardPoint = [0, 0]
}

function generateSlither() {
  ruleDisplay.style.display = "none"
  controlModeSelectBtn.selectedIndex = "2"
  controlMode.method = "keyboard"

  filledText.innerText = `Your score is ${slitherStatus.scores}`
  getPoint()
  slitherStatus.gameOver = checkGameOver()
  if (slitherStatus.gameOver) {
    handleGameOver()
  } else {
    setManualModeFalse()
    slitherStatus.recordUpdated = false
  }
  nextStep()
}

function nextStep() {
  let firstX = slitherArray[0][0]
  let firstY = slitherArray[0][1]

  const length = slitherArray.length

  // console.log("slitherArrayFirstItem",firstX, firstY)
  currentBoard[firstX][firstY].filled = 0

  // console.log("slither",slitherArray)
  for (let i = 0; i < length - 1; i++) {
    slitherArray[i][0] = (slitherArray[i + 1][0] + columns) % columns;
    slitherArray[i][1] = (slitherArray[i + 1][1] + rows) % rows;
  }

  switch (slitherStatus.direction) {
    case 'right':
      slitherArray[length - 1][0] = (slitherArray[length - 2][0] + 1 + columns) % columns;
      slitherArray[length - 1][1] = (slitherArray[length - 2][1] + rows) % rows;
      break;
    case 'up':
      slitherArray[length - 1][0] = (slitherArray[length - 2][0] + columns) % columns;
      slitherArray[length - 1][1] = (slitherArray[length - 2][1] - 1 + rows) % rows;
      break;
    case 'left':
      slitherArray[length - 1][0] = (slitherArray[length - 2][0] - 1 + columns) % columns;
      slitherArray[length - 1][1] = (slitherArray[length - 2][1] + rows) % rows;
      break;
    case 'down':
      slitherArray[length - 1][0] = (slitherArray[length - 2][0] + columns) % columns;
      slitherArray[length - 1][1] = (slitherArray[length - 2][1] + 1 + rows) % rows;
      break;
  }

  for (let i = 0; i < length; i++) {
    currentBoard[slitherArray[i][0]][slitherArray[i][1]].filled = 1
    // console.log(`nextBoard${[slitherArray[i][0]]} ${[slitherArray[i][1]]}`,nextBoard[slitherArray[i][0]][slitherArray[i][1]].filled)
  }
}

function getPoint() {
  // console.log("pointgen", slitherMarkGen)
  const { markCoordinates } = slitherStatus
  if (!slitherMarkGen) {
    slitherStatus["markCoordinates"] = [floor(random(0, columns)), floor(random(0, rows))]
    // console.log("pointCoordinates", markCoordinates[0], markCoordinates[1])
    slitherMarkGen = true
  }
  let headX = slitherArray[slitherArray.length - 1][0]
  let headY = slitherArray[slitherArray.length - 1][1]
  if (headX == markCoordinates[0] && headY == markCoordinates[1]) {
    currentBoard[markCoordinates[0]][markCoordinates[1]].filled = 0
    slitherStatus.scores += 1
    slitherStatus.speed += 2
    slitherArray.unshift([slitherArray[0][0], slitherArray[0][1]])
    slitherMarkGen = false
  } else {
    // console.log("markCoordinates",markCoordinates)
    currentBoard[markCoordinates[0]][markCoordinates[1]].filled = 1
  }
}

function checkGameOver() {
  let headX = slitherArray[slitherArray.length - 1][0]
  let headY = slitherArray[slitherArray.length - 1][1]
  // console.log("head", headX, headY)
  for (let i = 0; i < slitherArray.length - 1; i++) {
    let X = slitherArray[i][0]
    let Y = slitherArray[i][1]
    // console.log("line" + i, X, Y)
    if (headX == X && headY == Y) {
      // console.log("gameOver", headX, headY)
      return true;
    }
  }
}

function handleGameOver() {
  filledText.innerText = `Game Over! Your score is ${slitherStatus.scores}`
  startBtn.disabled = true
  stopBtn.disabled = true
  setManualModeTrue()

  if (!slitherStatus.recordUpdated) {
    let name = prompt(`Game Over! Your score is ${slitherStatus.scores}. Please enter your name`)
    while (!name) {
      name = prompt(`Game Over! Your score is ${slitherStatus.scores}. Please enter your name`)
    }

    const time = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString()
    // console.log(time);

    // unsafe, should use process.env
    firebase.initializeApp({
      apiKey: "AIzaSyD9UIG2m7nsEk0rlDEFHoUd5X-rtTv-HpA",
      authDomain: "fast-feedback-demo-af039.firebaseapp.com",
      projectId: "fast-feedback-demo-af039",
    })

    const db = firebase.firestore();

    db.collection("records").add({
      player: name,
      record: slitherStatus.scores,
      recordTime: time,
    })
    slitherStatus.recordUpdated = true
  }

  slitherStatus.gameOver = false
  init()
}

function resetSlither() {
  slitherArray = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]
  slitherStatus.direction = "right"
  slitherStatus.scores = 0
  slitherStatus.speed = 15
  startBtn.disabled = true
}

function manualFill() {
  if (mouseX > unitLength * columns || mouseY > unitLength * rows) {
    return;
  }
  const calX = floor(mouseX / unitLength);
  const calY = floor(mouseY / unitLength);
  const x = 0 > calX ? 0 : calX < columns - 1 ? calX : columns - 1
  const y = 0 > calY ? 0 : calY < rows - 1 ? calY : rows - 1
  // console.log("x",x, "y",y)
  currentBoard[x][y].filled = 1;
  mouseClicked[`[${x}][${y}]`] = 1
  if (controlMode.color == "customMode") {
    fill(lifeCustomColor[0], lifeCustomColor[1], lifeCustomColor[2])
  } else {
    fill(0);
  }
  stroke(strokeColor);
  rect(x * unitLength, y * unitLength, unitLength, unitLength);
}

function mouseDragged() {
  if (generateMode != "generateSlither" && controlMode.method == "mouse") {
    manualFill()
  }
}

function mousePressed() {
  if (generateMode != "generateSlither" && controlMode.method == "mouse") {
    manualFill()
    noLoop()
  }
}

function mouseReleased() {
  if (rule.initialRandomState) {
    rule.initialRandomState = false
    init()
  }
  if (manualMode == false && generateMode != "generateSlither" && controlMode.method == "mouse") {
    loop();
  }
}

function keyReleased() {
  if (manualMode == false && generateMode != "generateSlither" && controlMode.method == "keyboard") {
    loop();
  }
}

function ruleUpdate(birthStart, birthEnd, survivalStart, survivalEnd) {
  rule["birthStart"] = birthStart
  rulesBtns[0].value = birthStart
  rule["birthEnd"] = birthEnd
  rulesBtns[1].value = birthEnd
  rule["survivalStart"] = survivalStart
  rulesBtns[2].value = survivalStart
  rule["survivalEnd"] = survivalEnd
  rulesBtns[3].value = survivalEnd
}

function glider() {
  setManualModeFalse()
  for (let x = 3; x < columns; x += 5) {
    for (let y = 3; y < rows; y += 5) {
      currentBoard[x][y].filled = 1;
      currentBoard[x + 1][y + 1].filled = 1;
      currentBoard[x + 1][y + 2].filled = 1;
      currentBoard[x][y + 2].filled = 1;
      currentBoard[x - 1][y + 2].filled = 1;
    }
  }
  generateB3S23()
}

function gosperGliderGun() {
  setManualModeFalse()
  rule.limitedBoundary = true

  let x = 3;
  let y = 6;

  currentBoard[x][y].filled = 1;
  currentBoard[x + 1][y].filled = 1;
  currentBoard[x][y + 1].filled = 1;
  currentBoard[x + 1][y + 1].filled = 1;
  currentBoard[x + 10][y].filled = 1;
  currentBoard[x + 10][y + 1].filled = 1;
  currentBoard[x + 10][y + 2].filled = 1;
  currentBoard[x + 11][y - 1].filled = 1;
  currentBoard[x + 11][y + 3].filled = 1;
  currentBoard[x + 12][y - 2].filled = 1;
  currentBoard[x + 12][y + 4].filled = 1;
  currentBoard[x + 13][y - 2].filled = 1;
  currentBoard[x + 13][y + 4].filled = 1;
  currentBoard[x + 14][y + 1].filled = 1;
  currentBoard[x + 15][y - 1].filled = 1;
  currentBoard[x + 15][y + 3].filled = 1;
  currentBoard[x + 16][y].filled = 1;
  currentBoard[x + 16][y + 1].filled = 1;
  currentBoard[x + 16][y + 2].filled = 1;
  currentBoard[x + 17][y + 1].filled = 1;
  currentBoard[x + 20][y].filled = 1;
  currentBoard[x + 20][y - 1].filled = 1;
  currentBoard[x + 20][y - 2].filled = 1;
  currentBoard[x + 21][y].filled = 1;
  currentBoard[x + 21][y - 1].filled = 1;
  currentBoard[x + 21][y - 2].filled = 1;
  currentBoard[x + 22][y - 3].filled = 1;
  currentBoard[x + 22][y + 1].filled = 1;
  currentBoard[x + 24][y - 4].filled = 1;
  currentBoard[x + 24][y - 3].filled = 1;
  currentBoard[x + 24][y + 1].filled = 1;
  currentBoard[x + 24][y + 2].filled = 1;
  currentBoard[x + 34][y - 2].filled = 1;
  currentBoard[x + 34][y - 1].filled = 1;
  currentBoard[x + 35][y - 2].filled = 1;
  currentBoard[x + 35][y - 1].filled = 1;

  generateB3S23()
}

function generateGosper() {
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      // Count all living members in the Moore neighborhood(8 boxes surrounding)
      let neighbors = 0;
      for (let i of [-1, 0, 1]) {
        for (let j of [-1, 0, 1]) {
          if ((x == 0 && i == -1) || (x == columns - 1 && i == 1) || (y == 0 && j == -1) || (y == rows - 1 && j == 1)) {
            currentBoard[x][y].filled == 0
            continue
          }
          if ((i === 0 && j === 0)) {
            // the cell itself is not its own neighbor
            continue;
          }
          // The modulo operator is crucial for wrapping on the edge
          neighbors += currentBoard[x + i][y + j].filled;
        }
      }
      let { birthStart, birthEnd, survivalStart, survivalEnd } = rule
      // Rules of Life
      if ((x == 0) || (x == columns - 1) || (y == 0) || (y == rows - 1)) {
        nextBoard[x][y].filled = 0;
      } else if (currentBoard[x][y].filled == 1 && (neighbors < survivalStart || neighbors > survivalEnd)) {
        nextBoard[x][y].filled = 0;
      } else if (currentBoard[x][y].filled == 0 && !(neighbors < birthStart || neighbors > birthEnd)) {
        nextBoard[x][y].filled = 1;
      } else {
        nextBoard[x][y].filled = currentBoard[x][y].filled;
      }
      nextBoard[x][y].neighbors = neighbors
      if (nextBoard[x][y].filled == 1) {
        nextBoard[x][y].surviveRound += 1
      }
    }
  }

  // Swap the nextBoard to be the current Board
  [currentBoard, nextBoard] = [nextBoard, currentBoard];
}

document.querySelector('#reset-game')
  .addEventListener('click', function () {
    init();
  });

startBtn
  .addEventListener('click', function () {
    loop();
    startBtn.disabled = true
    stopBtn.disabled = false
  });

stopBtn
  .addEventListener('click', function () {
    noLoop();
    stopBtn.disabled = true
    startBtn.disabled = false
  });

manualBtn
  .addEventListener('click', function (e) {
    if (manualMode === true) {
      manualMode = false
      e.target.innerText = "Manual Mode: False"
      loop()
    } else {
      manualMode = true
      e.target.innerText = "Manual Mode: True"
      startBtn.disabled = false
      noLoop()
    }
  });

patternSelectBtn.addEventListener("change", (e) => {
  init();
  resetMouseMethod()
  if (e.target.value !== "instruction") {
    eval(e.target.value)()
  }
})

modeSelectBtn.addEventListener("change", (e) => {
  manualMode = false
  manualBtn.innerText = "Manual Mode: False"
  generateMode = "generate" + e.target.value
  rule.priority = 0
  resetMouseMethod()
  init()
})


colorModeSelectBtn.addEventListener("change", (e) => {
  controlMode.color = e.target.value
})

controlModeSelectBtn.addEventListener("change", (e) => {
  controlMode.method = e.target.value
  init()
})


for (let btn of rulesBtns) {
  btn.addEventListener("change", () => {
    rule["birthStart"] = parseInt(rulesBtns[0].value)
    rule["birthEnd"] = parseInt(rulesBtns[1].value)
    rule["survivalStart"] = parseInt(rulesBtns[2].value)
    rule["survivalEnd"] = parseInt(rulesBtns[3].value)
    rule.priority = 1
  })
}

function keyPressed() {
  if (controlMode.method == "keyboard") {
    switch (keyCode) {
      case LEFT_ARROW:
        if (generateMode == "generateSlither") {
          if (slitherStatus.direction !== 'right') {
            slitherStatus.direction = 'left';
          }
        } else {
          keyboardPoint = [(keyboardPoint[0] - 1 + columns) % columns, keyboardPoint[1]]
          // console.log("left",keyboardPoint)
        }
        break;
      case RIGHT_ARROW:
        if (generateMode == "generateSlither") {
          if (slitherStatus.direction !== 'left') {
            slitherStatus.direction = 'right';
          }
        } else {
          keyboardPoint = [(keyboardPoint[0] + 1 + columns) % columns, keyboardPoint[1]]
          // console.log("right",keyboardPoint)
        }
        break;
      case UP_ARROW:
        if (generateMode == "generateSlither") {
          if (slitherStatus.direction !== 'down') {
            slitherStatus.direction = 'up';
          }
        } else {
          keyboardPoint = [keyboardPoint[0], (keyboardPoint[1] - 1 + rows) % rows]
          // console.log("up",keyboardPoint)
        }
        break;
      case DOWN_ARROW:
        if (generateMode == "generateSlither") {
          if (slitherStatus.direction !== 'up') {
            slitherStatus.direction = 'down';
          }
        } else {
          keyboardPoint = [keyboardPoint[0], (keyboardPoint[1] + 1 + rows) % rows]
          // console.log("down",keyboardPoint)
        }
        break;
      case ENTER:
        if (generateMode != "generateSlither") {
          if (keyboardContinueOrPause % 2 == 0) {
            loop();
            keyboardContinueOrPause += 1
          } else {
            noLoop();
            keyboardContinueOrPause += 1
          }
        }
        break;
    }
    if (generateMode !== "generateSlither") {
      currentBoard[keyboardPoint[0]][keyboardPoint[1]].filled = 1;
      if (controlMode.color == "customMode") {
        fill(lifeCustomColor[0], lifeCustomColor[1], lifeCustomColor[2])
      } else {
        fill(0);
      }
      stroke(strokeColor);
      rect(x * unitLength, y * unitLength, unitLength, unitLength);
    }
  }
  return false
}