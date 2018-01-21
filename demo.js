"use strict";

function registerClickListeners() {
	var controls = document.getElementsByTagName("INPUT");

	for (var i = 0; i < controls.length; i++) {
		controls[i].onclick = function() {
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

function getHoleLength() {
	var entryValue = document.getElementById("holeLength").value;
	return parseFloat(entryValue);
}

function getHorizontalCenter() {
	var entryValue = document.getElementById("horizontalCenter").value;
	return parseFloat(entryValue);
}

function getMargin() {
	var entryValue = document.getElementById("margin").value;
	return parseFloat(entryValue);
}

function updateCanvas() {
	var canvas = document.getElementById("canvas");
	canvas.width = 400;
	canvas.height = 400;

	var spacing, shapeWidth, shapeLength;

	var pixelsPerInch = 300;

	var ctx = canvas.getContext("2d");
	var selectedShape = getSelectedShape();
	var margin = getMargin() * pixelsPerInch;

	shapeWidth = getHoleWidth() * pixelsPerInch;
	shapeLength = getHoleLength() * pixelsPerInch;
	spacing = getHorizontalCenter() * pixelsPerInch;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	generateVectors(ctx, canvas.width, canvas.height, shapeWidth, shapeLength, spacing, pixelsPerInch, selectedShape, margin);

	calculateOpenArea();
}

function generateVectors(ctx, width, height, shapeWidth, shapeLength, spacing, pixelsPerInch, selectedShape, margin) {
	ctx.moveTo(0, 0);

	ctx.fillStyle = "#000000";

	var startingCenterX = margin + (shapeWidth / 2),
		startingCenterY = margin + (shapeWidth / 2);

	var currentCenterX = startingCenterX,
		currentCenterY = startingCenterY;
	var row = 0;

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

			currentCenterX = startingCenterX;

			if ((row % 2) === 0) {
				if (selectedShape === "obround") {
					currentCenterX = currentCenterX + spacing;
				} else if (getSelectedAlignment() == "staggered60") {
					currentCenterX = currentCenterX + (spacing / 2);
				} else if (getSelectedAlignment() == "staggered45") {
					currentCenterX = currentCenterX + spacing / 2;
				}
			}
			row++;
			if (row > 1000) {
				return;
			}
		}
	}

	drawWidthLabel(ctx, startingCenterX, startingCenterY, shapeWidth);
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
	} else if (shape === "hex") {
		var hexRadius = getHoleWidth() / 2;
		var hexagonAngle = 30 * (Math.PI / 180);
		var hexOutsideRadius = hexRadius / Math.cos(hexagonAngle);
		openArea = ((3 * Math.sqrt(3)) / 2) * Math.pow(hexOutsideRadius, 2) / Math.pow(getHorizontalCenter(), 2);
	}
	var openAreaDisplay = openArea * 100;
	openAreaDisplay = Math.round(openAreaDisplay, 0);
	document.getElementById("openArea").value = openAreaDisplay + "%";
}
