"use strict";

function registerClickListeners() {
	var controls = document.getElementsByTagName("INPUT");

	for (var i = 0; i < controls.length; i++) {
		controls[i].onchange = function() {
			updateCanvas();
		};
	}
}

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

function setHoleWidth(value) {
	document.getElementById("holeWidth").value = value;
}

function setHoleWidthMax(max) {
	document.getElementById("holeWidth").setAttribute("max", max);
	if (getHoleWidth() > max) {
		setHoleWidth(max);
	}
}

function setHoleWidthMin(min) {
	document.getElementById("holeWidth").setAttribute("min", min);
	if (getHoleWidth() < min) {
		setHoleWidth(min);
	}
}

function getHoleLength() {
	var entryValue = document.getElementById("holeLength").value;
	return parseFloat(entryValue);
}

function setHoleLength(value) {
	document.getElementById("holeLength").value = value;
}

function setHoleLengthMin(min) {
  document.getElementById("holeLength").setAttribute("min", min);
	if (getHoleLength() < min) {
		setHoleLength(min);
	}
}

function setHoleLengthMax(max) {
  document.getElementById("holeLength").setAttribute("max", max);
	if (getHoleLength() > max) {
		setHoleLength(max);
	}
}

function getHorizontalCenter() {
	var entryValue = document.getElementById("horizontalCenter").value;
	return parseFloat(entryValue);
}

function getMargin() {
	var entryValue = document.getElementById("margin").value;
	return parseFloat(entryValue);
}

function getSheetWidth() {
	var entryValue = document.getElementById("sheetWidth").value;
	return parseFloat(entryValue);
}

function getSheetLength() {
	var entryValue = document.getElementById("sheetLength").value;
	return parseFloat(entryValue);
}

function setControlsAndLimits() {
	var showLength = false;
	if (getSelectedShape() === "circle") {
		setHoleWidthMin(0.05);
		setHoleWidthMax(4.5);
	} else if (getSelectedShape() === "obround") {
		showLength = true;
		setHoleWidthMin(0.032);
		setHoleWidthMax(2.5);
		setHoleLengthMin(0.25);
		setHoleLengthMax(4);
	} else if (getSelectedShape() === "square") {
		setHoleWidthMin(0.63);
		setHoleWidthMax(4.5);
	} else if (getSelectedShape() === "rectangle") {
		showLength = true;
		setHoleWidthMin(0.034);
		setHoleWidthMax(2.5);
		setHoleLengthMin(0.25);
		setHoleLengthMax(4);
	}
	if (showLength === true) {
		document.getElementById("controlLength").style.display = "block";
	} else {
		document.getElementById("controlLength").style.display = "none";
	}
}

function updateCanvas() {
	setControlsAndLimits();
	var canvas = document.getElementById("canvas");
	
	var bb = canvas.parentElement.getBoundingClientRect(),
       width = bb.right - bb.left - 50;
  canvas.width = width;
	
	var pixelsPerInch = width / getSheetWidth();
	
	canvas.height = getSheetLength() * pixelsPerInch;

	var spacing, shapeWidth, shapeLength;

	var ctx = canvas.getContext("2d");
	var selectedShape = getSelectedShape();
	var margin = getMargin() * pixelsPerInch;

	shapeWidth = getHoleWidth() * pixelsPerInch;
	shapeLength = getHoleLength() * pixelsPerInch;
	spacing = getHorizontalCenter() * pixelsPerInch;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	var shapes = generateVectors(ctx, canvas.width, canvas.height, shapeWidth, shapeLength, spacing, pixelsPerInch, selectedShape, margin);

	calculateOpenArea(shapes);
}

function generateVectors(ctx, width, height, shapeWidth, shapeLength, spacing, pixelsPerInch, selectedShape, margin) {
	ctx.moveTo(0, 0);

	ctx.fillStyle = "#000000";

	var startingCenterX = margin + (shapeWidth / 2),
		startingCenterY = margin + (shapeWidth / 2);

	var currentCenterX = startingCenterX,
		currentCenterY = startingCenterY;
	var row = 0;
	var shapes = 0;

	while (currentCenterY < (height - (shapeWidth / 2) - margin)) {

		if (selectedShape === "circle") {
			drawCircle(ctx, currentCenterX, currentCenterY, shapeWidth);
		} else if (selectedShape === "square") {
			drawSquare(ctx, currentCenterX, currentCenterY, shapeWidth);
		} else if (selectedShape === "obround") {
			drawObround(ctx, currentCenterX, currentCenterY, shapeWidth, shapeLength);
		} else if (selectedShape === "hex") {
			drawHexagon(ctx, currentCenterX, currentCenterY, shapeWidth);
		}
		shapes++;

		currentCenterX = currentCenterX + spacing;
		if (selectedShape === "obround") {
			currentCenterX = currentCenterX + spacing;
		}

		if ((currentCenterX + (shapeWidth / 2)) >= (width - margin)) {
      if (getSelectedAlignment() == "staggered60") {
        currentCenterY = currentCenterY + Math.sqrt(Math.pow(spacing, 2) - Math.pow(spacing / 2, 2));
      } else if (getSelectedAlignment() == "staggered45") {
        currentCenterY = currentCenterY + Math.cos(60 * (Math.PI / 180)) * spacing;
      } else {
        currentCenterY = currentCenterY + spacing;
      }
			
			if ((selectedShape === "obround") && ((row % 2) === 0)) {
				
			}

			currentCenterX = startingCenterX;

			if ((row % 2) === 0) {
				if (selectedShape === "obround") {
					currentCenterX = currentCenterX + spacing;
					currentCenterY = currentCenterY ;
				} else if (getSelectedAlignment() == "staggered60") {
					currentCenterX = currentCenterX + (spacing / 2);
				} else if (getSelectedAlignment() == "staggered45") {
					currentCenterX = currentCenterX + spacing / 2;
				}
			}
			row++;
			if (row > 1000) {
				return shapes;
			}
		}
	}

	drawWidthLabel(ctx, startingCenterX, startingCenterY, shapeWidth);
	return shapes;
}

function drawWidthLabel(canvasContext, x, y, width) {
	var halfWidth = width / 2;
	var startX = x - halfWidth;

	var labelText = "<- Width ->";
	canvasContext.font = "30px Arial";
	for (var textSizePx = 30; canvasContext.measureText(labelText).width > width; textSizePx--) {
		canvasContext.font = textSizePx + "px Arial";
	}

	canvasContext.fillStyle = "#FFFFFF";
	canvasContext.fillText(labelText, startX, y);
}

function drawLengthLabel(canvasContext, x, y, shapeWidth, canvasHeight) {
	var halfWidth = shapeWidth / 2;

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
	var halfWidth = width / 2;
	var startX = x - halfWidth;
	var startY = y - halfWidth;
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
	var radius = diameter / 2;
	canvasContext.beginPath();
	canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
	canvasContext.stroke();
	canvasContext.fill();
}

function drawObround(canvasContext, x, y, diameter, length) {
	var radius = diameter / 2;
	var linearLength = length - diameter;
	canvasContext.beginPath();
	canvasContext.arc(x, y, radius, Math.PI, 0);
	canvasContext.lineTo(x + radius, y + linearLength);
	canvasContext.arc(x, y + linearLength, radius, 0, Math.PI);
	canvasContext.lineTo(x - radius, y);
	canvasContext.closePath();

	canvasContext.stroke();
}

function drawHexagon(canvasContext, x, y, width) {
	var hexHeight,
		hexRadius,
		hexRectangleHeight,
		hexRectangleWidth,
		hexagonAngle = 30 * (Math.PI / 180), // 0.523598776, // 30 degrees in radians
		sideLength = 2 * Math.tan(hexagonAngle) * (width / 2);

	hexHeight = Math.sin(hexagonAngle) * sideLength;
	hexRadius = Math.cos(hexagonAngle) * sideLength;
	hexRectangleHeight = sideLength + 2 * hexHeight;
	hexRectangleWidth = 2 * hexRadius;
	var hexOutsideRadius = hexRadius / Math.cos(hexagonAngle);

	var startX = x - hexRadius;
	var startY = y - hexOutsideRadius;

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

function calculateOpenArea(shapes) {
	var shape = getSelectedShape();
	var sheetSqIn = getSheetWidth() * getSheetLength();
	var shapeArea;
	
	if (shape === "circle") {
		shapeArea = Math.PI * Math.pow(getHoleWidth() / 2, 2);
	} else if (shape === "square") {
		shapeArea = Math.pow(getHoleWidth(), 2);
	} else if (shape === "hex") {
		var hexRadius = getHoleWidth() / 2;
		var hexagonAngle = 30 * (Math.PI / 180);
		var hexOutsideRadius = hexRadius / Math.cos(hexagonAngle);
		shapeArea = ((3 * Math.sqrt(3)) / 2) * Math.pow(hexOutsideRadius, 2);
	} else if (shape === "obround") {
		// circular ends
		shapeArea = Math.pow(getHoleWidth(), 2);
		// rectangular center
		shapeArea = shapeArea + (getHoleWidth() * (getHoleLength() - getHoleWidth()));
	}
	
	var openArea = shapeArea * shapes;
	
	var openAreaDisplay = openArea / sheetSqIn * 100;
	openAreaDisplay = Math.round(openAreaDisplay, 0);
	document.getElementById("openArea").value = openAreaDisplay + "%";
}
