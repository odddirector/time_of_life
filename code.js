var rows = 180;
var cols = 600;

var playing = false;

var grid = new Array(rows);
var nextGrid = new Array(rows);

var timer;
var reproductionTime = 100;
let clockInterval = 200;

let clockSetInt;

function initializeGrids() {
  for (var i = 0; i < rows; i++) {
    grid[i] = new Array(cols);
    nextGrid[i] = new Array(cols);
  }
}

function resetGrids() {
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      grid[i][j] = 0;
      nextGrid[i][j] = 0;
    }
  }
}

function copyAndResetGrid() {
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      grid[i][j] = nextGrid[i][j];
      nextGrid[i][j] = 0;
    }
  }
}

// Initialize
function initialize() {
  createTable();
  initializeGrids();
  resetGrids();
}

// Lay out the board
function createTable() {
  var gridContainer = document.getElementById("gridContainer");
  if (!gridContainer) {
    // Throw error
    console.error("Problem: No div for the drid table!");
  }
  var table = document.createElement("table");
  table.id = "lifeTable";
  
  console.log("created table");
  console.log("rows = " + rows);

  for (var i = 0; i < rows; i++) {
    console.log("added row");
    var tr = document.createElement("tr");
    for (var j = 0; j < cols; j++) {
      //
      var cell = document.createElement("td");
      cell.setAttribute("id", i + "_" + j);
      cell.setAttribute("class", "dead");
      cell.onclick = cellClickHandler;
      tr.appendChild(cell);
    }
    table.appendChild(tr);
  }
  gridContainer.appendChild(table);
}

function cellClickHandler() {
  var rowcol = this.id.split("_");
  var row = rowcol[0];
  var col = rowcol[1];

  var classes = this.getAttribute("class");
  if (classes.indexOf("live") > -1) {
    this.setAttribute("class", "dead");
    grid[row][col] = 0;
  } else {
    this.setAttribute("class", "live");
    grid[row][col] = 1;
  }
}

function updateView() {
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      var cell = document.getElementById(i + "_" + j);
      if (grid[i][j] == 0) {
        cell.setAttribute("class", "dead");
      } else {
        cell.setAttribute("class", "live");
      }
    }
  }
}

function setupControlButtons() {
  // button to start
  var startButton = document.getElementById("start");
  startButton.onclick = startButtonHandler;

  // button to clear
  var clearButton = document.getElementById("clear");
  clearButton.onclick = clearButtonHandler;

  // button to set random initial state
//   var randomButton = document.getElementById("random");
//   randomButton.onclick = randomButtonHandler;
}

// function randomButtonHandler() {
//   //if (playing) return;
//   //console.log(two);

//   //clearButtonHandler();
//   // for (var i = 0; i < rows; i++) {
//   //     for (var j = 0; j < cols; j++) {
//   //         var isLive = Math.round(Math.random());
//   //         if (isLive == 1) {
//   //             var cell = document.getElementById(i + "_" + j);
//   //             cell.setAttribute("class", "live");
//   //             grid[i][j] = 1;
//   //         }
//   //     }
//   // }

//   let offsetX = 20;
//   let offsetY = 18;

//   for (var i = 0; i < rows; i++) {
//     for (var j = 0; j < cols; j++) {
//       if (typeof timeArray[i][j] !== "undefined") {
//         if (timeArray[i][j] == 1) {
//           var cell = document.getElementById(i + offsetY + "_" + (j + offsetX));
//           cell.setAttribute("class", "live");
//           grid[i + offsetY][j + offsetX] = 1;
//         }
//       }
//     }
//   }
// }

// clear the grid
function clearButtonHandler() {
  console.log("Clear the game: stop playing, clear the grid");

  playing = false;
  var startButton = document.getElementById("start");
  startButton.innerHTML = "Start";
  clearTimeout(timer);

  var cellsList = document.getElementsByClassName("live");
  // convert to array first, otherwise, you're working on a live node list
  // and the update doesn't work!
  var cells = [];
  for (var i = 0; i < cellsList.length; i++) {
    cells.push(cellsList[i]);
  }

  for (var i = 0; i < cells.length; i++) {
    cells[i].setAttribute("class", "dead");
  }
  resetGrids;
}

// start/pause/continue the game
function startButtonHandler() {
  if (playing) {
    console.log("Pause the game");
    playing = false;
    this.innerHTML = "Continue";
    clearTimeout(timer);
  } else {
    console.log("Continue the game");
    playing = true;
    this.innerHTML = "Pause";
    play();
  }

  runClock();

}

function runClock() {
    // Update the clock every second
    clockSetInt = setInterval(drawClock, clockInterval);

    // Initial draw
    drawClock();
}

// run the life game
function play() {
  computeNextGen();

  if (playing) {
    timer = setTimeout(play, reproductionTime);
  }
}

function computeNextGen() {
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      applyRules(i, j);
    }
  }

  // copy NextGrid to grid, and reset nextGrid
  copyAndResetGrid();
  // copy all 1 values to "live" in the table
  updateView();
}

// RULES
// Any live cell with fewer than two live neighbours dies, as if caused by under-population.
// Any live cell with two or three live neighbours lives on to the next generation.
// Any live cell with more than three live neighbours dies, as if by overcrowding.
// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

function applyRules(row, col) {
  var numNeighbors = countNeighbors(row, col);
  if (grid[row][col] == 1) {
    if (numNeighbors < 2) {
      nextGrid[row][col] = 0;
    } else if (numNeighbors == 2 || numNeighbors == 3) {
      nextGrid[row][col] = 1;
    } else if (numNeighbors > 3) {
      nextGrid[row][col] = 0;
    }
  } else if (grid[row][col] == 0) {
    if (numNeighbors == 3) {
      nextGrid[row][col] = 1;
    }
  }
}

function countNeighbors(row, col) {
  var count = 0;
  if (row - 1 >= 0) {
    if (grid[row - 1][col] == 1) count++;
  }
  if (row - 1 >= 0 && col - 1 >= 0) {
    if (grid[row - 1][col - 1] == 1) count++;
  }
  if (row - 1 >= 0 && col + 1 < cols) {
    if (grid[row - 1][col + 1] == 1) count++;
  }
  if (col - 1 >= 0) {
    if (grid[row][col - 1] == 1) count++;
  }
  if (col + 1 < cols) {
    if (grid[row][col + 1] == 1) count++;
  }
  if (row + 1 < rows) {
    if (grid[row + 1][col] == 1) count++;
  }
  if (row + 1 < rows && col - 1 >= 0) {
    if (grid[row + 1][col - 1] == 1) count++;
  }
  if (row + 1 < rows && col + 1 < cols) {
    if (grid[row + 1][col + 1] == 1) count++;
  }
  return count;
}

// Function to draw the current time on the canvas
function drawClock() {
  
  if (playing == false) return;

  const canvas = document.getElementById("clockCanvas");
  const ctx = canvas.getContext("2d");

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Get current time
  const now = new Date();
  const timeString = now.toLocaleTimeString();

  // Set font and color
  // Draw the time on the canvas
  ctx.font = "137px Arial";
//   ctx.strokeStyle = 'black';
//   ctx.lineWidth = 8;
//   ctx.strokeText(timeString, 0, 49);
  ctx.fillStyle = 'black';
  ctx.fillText(timeString, 0, 110);


  // Convert canvas to 2D array
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const twoDArray = [];

  for (let i = 0; i < canvas.height; i++) {
    const row = [];
    for (let j = 0; j < canvas.width; j++) {
      const index = (i * canvas.width + j) * 4;
      const isBlack =
        imageData[index] > 0 ||
        imageData[index + 1] > 0 ||
        imageData[index + 2] > 0 ||
        imageData[index + 3] > 0;
      row.push(isBlack ? 1 : 0);
    }
    twoDArray.push(row);
  }

  // Log the 2D array to the console
  //console.log(twoDArray);

  //Draw the clock on a grid
  
  let offsetX = 20;
  let offsetY = 18;

  for (var i = 0; i < canvas.height; i++) {
    for (var j = 0; j < canvas.width; j++) {
      if (typeof twoDArray[i][j] !== "undefined") {
        if (twoDArray[i][j] == 1) {
          var cell = document.getElementById(i + offsetY + "_" + (j + offsetX));
          //cell.setAttribute("class", "live");
          grid[i + offsetY][j + offsetX] = 1;
        }
      }
    }
  }

}

// Events

window.addEventListener("load",function(event) {
    initialize();
    setupControlButtons();
},false);

let cellWidth = document.getElementById('cellWidth');

cellWidth.addEventListener('change', (event) => {
    let newWidth = event.target.value;
    let newStyle = "td { height: "+newWidth+"px; }";
    var styleSheet = document.createElement("style");
    styleSheet.innerText = newStyle;
    document.head.appendChild(styleSheet);
});

let cellBorder = document.getElementById('cellBorder');

cellBorder.addEventListener('change', (event) => {
    let newBorder = event.target.value;
    let newStyle = "td.live { border-radius: "+newBorder+"%; }";
    var styleSheet = document.createElement("style");
    styleSheet.innerText = newStyle;
    document.head.appendChild(styleSheet);
});

let colorPicker = document.getElementById('colorPicker');

colorPicker.addEventListener('change', (event) => {
    let newColor = event.target.value;
    let newStyle = "td.live { background-color: "+newColor+"; }";
    var styleSheet = document.createElement("style");
    styleSheet.innerText = newStyle;
    document.head.appendChild(styleSheet);
});

let bgColorPicker = document.getElementById('bgColorPicker');

bgColorPicker.addEventListener('change', (event) => {
    let newColor = event.target.value;
    let newStyle = "body { background-color: "+newColor+"; }";
    var styleSheet = document.createElement("style");
    styleSheet.innerText = newStyle;
    document.head.appendChild(styleSheet);
});



// let fidelity = document.getElementById('fidelity');

// fidelity.addEventListener('mouseup', (event) => {

//     let rowStep = rows / 5;
//     let colStep = cols / 5;

//     playing = false;

//     clearInterval(clockSetInt);
    
//     // change the grid variables 
//     //rows = fidelity.value;

//     document.getElementById("lifeTable").remove();

//     initialize();

//     playing = true;
//     runClock();
//     play();
// });