function registerClickListeners() {
  var controls = document.getElementsByTagName("INPUT");

  for (var i = 0; i < controls.length; i++) {
    controls[i].onclick = function() {
      updateCanvas();
    }
  }
}

registerClickListeners();

function getSelectedShape() {
  var shapes = document.getElementsByName("shape");
  for (var i = 0; i < shapes.length; i++) {
    if (shapes[i].checked) {
      return shapes[i].value;
    }
  }
}

function getSelectedAlignment() {
  var alignments = document.getElementsByName("alignment");
  for (var i = 0; i < alignments.length; i++) {
    if (alignments[i].checked) {
      return alignments[i].value;
    }
  }
}

function getHoleWidth() {
  var entryValue = document.getElementById("holeWidth").value;
  return parseFloat(entryValue);
}

function getHoleLength() {
  var entryValue = document.getElementById("holeLength").value;
  return parseFloat(entryValue);
}

function getVerticalCenter() {
  var entryValue = document.getElementById("verticalCenter").value;
  return parseFloat(entryValue);
}

function getHorizontalCenter() {
  var entryValue = document.getElementById("horizontalCenter").value;
  return parseFloat(entryValue);
}

function updateCanvas() {
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var selectedShape = getSelectedShape();

  console.log(getSelectedShape());
  console.log(getSelectedAlignment());

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.moveTo(0, 0);

  ctx.fillStyle = "#000000";

  var spacing, shapeWidth;

  shapeWidth = 80;

  spacing = shapeWidth / 2;

  var startingCenterX = 50,
    startingCenterY = 50;

  var currentCenterX = startingCenterX,
    currentCenterY = startingCenterY;
  var row = 0;

  while (currentCenterY < (canvas.height + shapeWidth)) {

    if (selectedShape === "circle") {
      drawCircle(ctx, currentCenterX, currentCenterY, shapeWidth);
    } else if (selectedShape === "square") {
      drawSquare(ctx, currentCenterX, currentCenterY, shapeWidth);
    } else if (selectedShape === "hex") {
      drawHexagon(ctx, currentCenterX, currentCenterY);
    }

    currentCenterX = currentCenterX + shapeWidth + spacing;

    if (currentCenterX > canvas.width) {
      currentCenterY = currentCenterY + shapeWidth + spacing;
      currentCenterX = startingCenterX;
      if ((getSelectedAlignment() !== "inline") && ((row % 2) === 0)) {
        currentCenterX = currentCenterX + (shapeWidth + spacing) / 2;
      }
    }

    row++;
    if (row > 1000) {
      return;
    }
  }

  calculateOpenArea();

  drawWidthLabel(ctx, startingCenterX, startingCenterY, shapeWidth);

  //, canvas.height);
}

function drawWidthLabel(canvasContext, x, y, width) {
  console.log("width: " + width);

  halfWidth = width / 2;
  startX = x - halfWidth;

  var labelText = "<- Width ->";
  canvasContext.font = "30px Arial";
  for (var textSizePx = 30; canvasContext.measureText(labelText).width > width; textSizePx--) {
    canvasContext.font = textSizePx + "px Arial";
  }

  canvasContext.fillStyle = "#FFFFFF";
  canvasContext.fillText(labelText, startX, y);
}

function drawLengthLabel(canvasContext, x, y, shapeWidth, canvasHeight) {
  console.log("x: " + x + " y: " + y);
  halfWidth = shapeWidth / 2;
  startX = x - shapeWidth;

  canvasContext.rotate(-90 * Math.PI / 180);

  canvasContext.fillStyle = "#FFFFFF";
  var labelText = "<- Hole Length ->";
  canvasContext.font = "30px Arial";
  for (var textSizePx = 30; canvasContext.measureText(labelText).width > shapeWidth; textSizePx--) {
    canvasContext.font = textSizePx + "px Arial";
  }

  canvasContext.fillText(labelText, (-x - halfWidth), y);
}

function drawSquare(canvasContext, x, y, width) {
  halfWidth = width / 2;
  startX = x - halfWidth;
  startY = y - halfWidth;
  canvasContext.beginPath();
  canvasContext.moveTo(startX, startY);
  canvasContext.lineTo(startX, startY + width);
  canvasContext.lineTo(startX + width, startY + width);
  canvasContext.lineTo(startX + width, startY);
  canvasContext.lineTo(startX, startY);
  canvasContext.closePath();
  canvasContext.fill();
  canvasContext.stroke();
}

function drawCircle(canvasContext, x, y, diameter) {
  radius = diameter / 2;
  canvasContext.beginPath();
  canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
  canvasContext.stroke();
  canvasContext.fill();
}

function drawHexagon(canvasContext, x, y) {
  var hexHeight,
    hexRadius,
    hexRectangleHeight,
    hexRectangleWidth,
    hexagonAngle = 30 * (Math.PI / 180), // 0.523598776, // 30 degrees in radians
    sideLength = 50;

  hexHeight = Math.sin(hexagonAngle) * sideLength;
  hexRadius = Math.cos(hexagonAngle) * sideLength;
  hexRectangleHeight = sideLength + 2 * hexHeight;
  hexRectangleWidth = 2 * hexRadius;

  startX = x - hexRadius;
  startY = y - hexRadius;

  canvasContext.beginPath();
  canvasContext.moveTo(startX + hexRadius, startY);
  canvasContext.lineTo(startX + hexRectangleWidth, startY + hexHeight);
  canvasContext.lineTo(startX + hexRectangleWidth, startY + hexHeight + sideLength);
  canvasContext.lineTo(startX + hexRadius, startY + hexRectangleHeight);
  canvasContext.lineTo(startX, startY + sideLength + hexHeight);
  canvasContext.lineTo(startX, startY + hexHeight);
  canvasContext.closePath();
  canvasContext.fill();
}

function calculateOpenArea() {
  var shape = getSelectedShape();
  var alignment = getSelectedAlignment();
  var openArea;
  if (shape === "circle") {
    if (alignment === "inline") {
      openArea = Math.pow(getHoleWidth(), 2) * 0.7854 / Math.pow(getHorizontalCenter(), 2);
    } else if (alignment === "staggered") {
      openArea = Math.pow(getHoleWidth(), 2) * 0.9069 / Math.pow(getHorizontalCenter(), 2);
    }
  } else if (shape === "square") {
    openArea = Math.pow(getHoleWidth(), 2) / Math.pow(getHorizontalCenter(), 2);
  }
  var openAreaDisplay = openArea * 100;
  openAreaDisplay = Math.round(openAreaDisplay, 0);
  document.getElementById("openArea").value = openAreaDisplay + "%";
}

