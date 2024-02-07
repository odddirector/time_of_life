let canvasWidth = 530;
let canvasHeight = 300;

let fontSize = 120; // default size for font

let fontYoffset = 0;

let clockFill = false;

let fonts = [
    "Arial",
    "Lato",
    "Reggae One",
    "Codystar",
    "Monsieur La Doulaise",
    "Fredericka the Great",
    "Cabin Sketch",
    "Astloch",
    "Monoton",
    "Rubik Doodle Triangles",
    "Rubik Lines",
    "Rubik Scribble",
    "Rubik Glitch Pop",
    "Londrina Outline",
    "Bungee Outline"
];

let cellBorderWidthVar = 0;
let cellBorderColorVar = "black";

let fontFace = fonts[0];

var rows = canvasHeight;
var cols = canvasWidth;

// required for setting the font size dynamically
let defaultCanvasWidth = canvasWidth;

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
  setCellRatio();
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
    for (var i = 0; i < canvasHeight; i++) {
        for (var j = 0; j < canvasWidth; j++) {
            var cell = document.getElementById(i + "_" + j);
            cell.setAttribute("class", "dead");
            grid[i][j] = 0;
        }
      }
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

  let previousCanvas = document.getElementById("clockCanvas");
  if(previousCanvas) {
    previousCanvas.remove();
  }

  const canvas = document.createElement("canvas");
  canvas.id = "clockCanvas";
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  //document.body.insertBefore(canvas, document.getElementById("gridContainer"));
  
  const ctx = canvas.getContext("2d");

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Get current time
  const now = new Date();
  const timeString = now.toLocaleTimeString();

  let fontBase = defaultCanvasWidth; // selected default width for canvas
  
  let ratio = fontSize / fontBase;   // calc ratio
  let size = canvas.width * ratio;

  // Set font and color
  // Draw the time on the canvas

  ctx.font = size+"px "+fontFace;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'black';

  let x = canvas.width / 2.1;
  let y = canvas.height / 1.9;

  ctx.fillText(timeString, x, y - fontYoffset);


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
  
  let offsetX = 0;
  let offsetY = 0;

  for (var i = 0; i < canvas.height; i++) {
    for (var j = 0; j < canvas.width; j++) {
      if (typeof twoDArray[i][j] !== "undefined") {
        if (twoDArray[i][j] == 1) {
          var cell = document.getElementById(i + offsetY + "_" + (j + offsetX));
          
          if(clockFill) {
            cell.setAttribute("class", "live");
          }
          
          grid[i + offsetY][j + offsetX] = 1;
        }
      }
    }
  }

}

function setCellRatio() {
    let gridContainer = document.getElementById("gridContainer");
    let newTdHeight = gridContainer.offsetWidth / cols;

    let newStyle = "td { height: "+newTdHeight+"px; width: "+newTdHeight+"px;  }";
    var styleSheet = document.createElement("style");
    styleSheet.innerText = newStyle;
    document.head.appendChild(styleSheet);
}

function initFontPicker() {
    let fontPicker = document.getElementById("fontPicker");

    for (let index = 0; index < fonts.length; index++) {
        const face = fonts[index];
        let p = document.createElement("p");
        p.innerHTML = face;
        p.classList.add(face.toLowerCase().replace(/ /g, "-"));

        let atRow = "row_1";
        if(index >= fonts.length/2) {
            atRow = "row_2";
        }
        
        document.getElementById(atRow).append(p);
    }

    let fontFaces = document.querySelectorAll("#fontPicker p");

    for (var i = 0; i < fontFaces.length; i++) {
        fontFaces[i].addEventListener('click', (event) => {
            let newFontFace = event.target.innerHTML;
            fontFace = newFontFace;
            setCookie("font", newFontFace, 10000);
        });
    }
}


// cookies 

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function loadStatesFromCookies() {

    let cookies = {
        cellBorder: getCookie("cellBorder"),
        cellColor: getCookie("cellColor"),
        bgColor: getCookie("bgColor"),
        fill: getCookie("fill"),
        font: getCookie("font"),
        clockPrintTime: getCookie("clockPrintTime"),
        reproduction: getCookie("reproduction"),
        fontSize: getCookie("fontSize"),
        fidelity: getCookie("fidelity"),
        cellBorderColor: getCookie("cellBorderColor"),
        cellBorderWidth: getCookie("cellBorderWidth"),
        fontY: getCookie("fontY")
    };

    if (cookies.cellBorder) setCellBorder(cookies.cellBorder); 
    if (cookies.cellColor) setCellColor(cookies.cellColor);
    if (cookies.bgColor) setBgColor(cookies.bgColor);
    if (cookies.fill) isFill(cookies.fill);
    if (cookies.font) fontFace = cookies.font;
    if (cookies.clockPrintTime) setClockPrintTime(cookies.clockPrintTime);
    if (cookies.reproduction) setReproduction(cookies.reproduction);
    if (cookies.fontSize) setFontSize(cookies.fontSize);
    if (cookies.fidelity) setFidelity(cookies.fidelity);
    if (cookies.cellBorderWidth) setBorderWidth(cookies.cellBorderWidth);
    if (cookies.cellBorderColor) setCellBorderColor(cookies.cellBorderColor);
    if (cookies.fontY) setfontY(cookies.fontY);
    
}

// Events

window.addEventListener("load",function(event) {
    initialize();
    setupControlButtons();
    startButtonHandler();
    initFontPicker();
    loadStatesFromCookies();
},false);

// let cellWidth = document.getElementById('cellWidth');

// cellWidth.addEventListener('change', (event) => {
//     setCellWidth(event.target.value);
//     setCookie("cellWidth", newWidth, 10000);
// });

// function setCellWidth(val) {
//     let newWidth = val;
//     let newStyle = "td { height: "+newWidth+"px; }";
//     var styleSheet = document.createElement("style");
//     styleSheet.innerText = newStyle;
//     document.head.appendChild(styleSheet);
// }

let cellBorder = document.getElementById('cellBorder');

cellBorder.addEventListener('change', (event) => {
    setCellBorder(event.target.value); 
    setCookie("cellBorder", event.target.value, 10000);
});

function setCellBorder(val) {
    let newBorder = val;
    let newStyle = "td.live { border-radius: "+newBorder+"%; }";
    var styleSheet = document.createElement("style");
    styleSheet.innerText = newStyle;
    document.head.appendChild(styleSheet);
}

let colorPicker = document.getElementById('colorPicker');

colorPicker.addEventListener('change', (event) => {
    setCellColor(event.target.value);
    setCookie("cellColor", event.target.value, 10000);
});

function setCellColor(val) {
    let newColor = val;
    let newStyle = "td.live { background-color: "+newColor+"; }";
    var styleSheet = document.createElement("style");
    styleSheet.innerText = newStyle;
    document.head.appendChild(styleSheet);
}

let bgColorPicker = document.getElementById('bgColorPicker');

bgColorPicker.addEventListener('change', (event) => {
    setBgColor(event.target.value);
    setCookie("bgColor", event.target.value, 10000);
});

function setBgColor(val) {
    let newColor = val;
    let newStyle = "body { background-color: "+newColor+"; }";
    var styleSheet = document.createElement("style");
    styleSheet.innerText = newStyle;
    document.head.appendChild(styleSheet);
}


let fidelity = document.getElementById('fidelity');

fidelity.addEventListener('mouseup', () => {
    setFidelity(fidelity.value);
    setCookie("fidelity", fidelity.value, 10000);
});

function setFidelity(val) {
    let canvWidthStep = canvasWidth / 5;
    let canvHeightStep = canvasHeight / 5;

    playing = false;

    clearInterval(clockSetInt);

    canvasWidth = canvWidthStep * val;
    canvasHeight = canvHeightStep * val;

    rows = Math.round(canvasHeight);
    cols = Math.round(canvasWidth);

    document.getElementById("lifeTable").remove();

    initialize();

    playing = true;
    runClock();
    play();
}


addEventListener("resize", (event) => {
    setCellRatio();
});


let fontSizePicker = document.getElementById('fontsize');

fontSizePicker.addEventListener('change', (event) => {
    setFontSize(event.target.value);
    setCookie("fontSize", event.target.value, 10000);
});

function setFontSize(val) {
    let newFontSize = val;
    fontSize = newFontSize;
}


let reproduction = document.getElementById('reproduction');

reproduction.addEventListener('change', (event) => {
    setReproduction(event.target.value); 
    setCookie("reproduction", event.target.value, 10000);
});

function setReproduction(val) {
    let newReproductionTime = val;
    reproductionTime = newReproductionTime;
}

let clockPrintTime = document.getElementById('clockPrintTime');

clockPrintTime.addEventListener('mouseup', (event) => {
    setClockPrintTime(event.target.value);
    setCookie("clockPrintTime", event.target.value, 10000);
});

function setClockPrintTime(val) {
    let newClockPrintTime = val;
    clearInterval(clockSetInt);
    clockInterval = newClockPrintTime;
    runClock();     
}



let fill = document.getElementById('fill');

fill.addEventListener('change', (event) => {
    isFill(fill.checked);
    setCookie("fill", fill.checked, 10000);
});

function isFill(val) {
    if(val == true) {
        clockFill = true;
    } else {
        clockFill = false;
    }
}

let cellBorderWidth = document.getElementById('cellBorderWidth');

cellBorderWidth.addEventListener('change', (event) => {
    setBorderWidth(event.target.value);
    setCookie("cellBorderWidth", event.target.value, 10000);
});

function setBorderWidth(val) {
    let newWidth = val;
    cellBorderWidthVar = val;
    let newStyle = "td { border: "+newWidth+"px solid "+cellBorderColorVar+"; }";
    var styleSheet = document.createElement("style");
    styleSheet.innerText = newStyle;
    document.head.appendChild(styleSheet);
}

let cellBorderColor = document.getElementById('cellBorderColor');

cellBorderColor.addEventListener('change', (event) => {
    setCellBorderColor(event.target.value);
    setCookie("cellBorderColor", event.target.value, 10000);
});

function setCellBorderColor(val) {
   
    let newColor = val;
    let newStyle = "td { border: "+cellBorderWidthVar+"px solid "+newColor+"; }";
    var styleSheet = document.createElement("style");
    styleSheet.innerText = newStyle;
    document.head.appendChild(styleSheet);
    
}


let fontY = document.getElementById('fontY');

fontY.addEventListener('change', (event) => {
    setfontY(event.target.value);
    setCookie("fontY", event.target.value, 10000);
});

function setfontY(val) {
    fontYoffset = val;
}