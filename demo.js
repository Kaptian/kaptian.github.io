"use strict";

var MIN_METAL = 0.032;
var renderingDwg = false;

function registerClickListeners() {
	var controls = document.getElementsByTagName("INPUT");

	for (var i = 0; i < controls.length; i++) {
		controls[i].onchange = function() {
			updateCanvas();
		};
		controls[i].onblur = function () {
			updateCanvas();
		};
		controls[i].onclick = function () {
			updateCanvas();
		}
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

function setSelectedAlignment(alignment) {
	var alignments = document.getElementsByName("alignment");
	for (var i = 0; i < alignments.length; i++) {
		if (alignments[i].value === alignment) {
			alignments[i].checked = true;
		} else {
			alignments[i].checked = false;
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

function setHorizontalCenter(value) {
	document.getElementById("horizontalCenter").value = value;
}

function setHorizontalCenterMin(min) {
	document.getElementById("horizontalCenter").setAttribute("min", min);
	if (getHorizontalCenter() < min) {
		setHorizontalCenter(min);
	}
}

function getVerticalCenter() {
	if ((getSelectedShape() === "circle") || (getSelectedShape() === "square")
		|| ((getSelectedShape() === "hex") && (getSelectedAlignment() === "inline"))) {
		return getHorizontalCenter();
	} else {
		var entryValue = document.getElementById("verticalCenter").value;
		return parseFloat(entryValue);
	}
}

function setVerticalCenter(value) {
	document.getElementById("verticalCenter").value = value;
}

function setVerticalCenterMin(min) {
	document.getElementById("verticalCenter").setAttribute("min", min);
	if (getVerticalCenter() < min) {
		setVerticalCenter(min);
	}
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
	var showVerticalCenter = false;
	var showAlignStaggered60 = true;
	var shape = getSelectedShape();
	var align = getSelectedAlignment();
	var width = getHoleWidth();
	var length = getHoleLength();

	if (shape === "circle") {
		setHoleWidthMin(0.05);
		setHoleWidthMax(4.5);
	} else if (shape === "obround") {
		showLength = true;
		showVerticalCenter = true;
		setHoleWidthMin(0.032);
		setHoleWidthMax(2.5);
		setHoleLengthMin(0.25);
		setHoleLengthMax(4);
		setHoleLengthMin(width);
		showAlignStaggered60 = false;
	} else if (shape === "square") {
		setHoleWidthMin(0.125);
		setHoleWidthMax(4.5);
	} else if (shape === "rectangle") {
		showLength = true;
		showVerticalCenter = true;
		setHoleWidthMin(0.034);
		setHoleWidthMax(2.5);
		setHoleLengthMin(0.25);
		setHoleLengthMax(4);
		showAlignStaggered60 = false;
	}

	if (showLength === true) {
		document.getElementById("controlLength").style.display = "block";
		document.getElementById("controlVerticalCenter").style.display = "block";
	} else {
		document.getElementById("controlLength").style.display = "none";
		document.getElementById("controlVerticalCenter").style.display = "none";
	}

	if (showAlignStaggered60) {
		document.getElementById("alignStaggered60").style.display = "block";
	} else {
		if (align === "staggered60") {
			setSelectedAlignment("inline");
		}
		document.getElementById("alignStaggered60").style.display = "none";
	}

	// set min spacing
	if (shape === "circle") {
		if ((align === "inline") || (align === "staggered60")) {
			setHorizontalCenterMin(width + MIN_METAL);
		} else if (align === "staggered45") {
			setHorizontalCenterMin(Math.sqrt(Math.pow((2 * width + 2 * MIN_METAL), 2) / 2));
		}
	} else if (shape === "square") {
		if ((align === "inline") || (align === "staggered60")) {
			setHorizontalCenterMin(width + MIN_METAL);
		} else if (align === "staggered45") {
			setHorizontalCenterMin((2 * width) + 2 * Math.sqrt(0.5 * Math.pow(MIN_METAL, 2)));
		}
	} else if ((shape === "obround") || (shape === "rectangle")) {
		setHorizontalCenterMin(width + MIN_METAL);
		setVerticalCenterMin(length + MIN_METAL);
	} else if (shape === "hex") {
		if (align === "inline") {
			var hexHeight = getHexHeight(width);
			setHorizontalCenterMin(getHexSideLength(width) + 2 * hexHeight);
		} else if (align === "staggered60") {
			setHorizontalCenterMin(width + MIN_METAL);
		} else if (align === "staggered45") {
			setHorizontalCenterMin(Math.sqrt(Math.pow((2 * width + 2 * MIN_METAL), 2) / 2));
		}
	}
}

function updateCanvas() {
	setControlsAndLimits();
	var canvas = document.getElementById("canvas");

	var bb = canvas.parentElement.getBoundingClientRect(),
		width = bb.right - bb.left - 50;
	canvas.width = width;
	
	var pixelsPerInch = width / getSheetWidth();
	
	var ctx = canvas.getContext("2d");
	canvas.height = getSheetLength() * pixelsPerInch;
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	gatherSettingsAndDraw(ctx, width, canvas.height, pixelsPerInch, false);
}

function gatherSettingsAndDraw(ctx, width, height, pixelsPerInch, isPdf) {
	var spacing, verticalSpacing, shapeWidth, shapeLength;

	var selectedShape = getSelectedShape();
	var selectedAlignment = getSelectedAlignment();
	var margin = getMargin() * pixelsPerInch;

	shapeWidth = getHoleWidth() * pixelsPerInch;
	
	spacing = getHorizontalCenter() * pixelsPerInch;

	if ((selectedShape === "obround") || (selectedShape === "rectangle")) {
		verticalSpacing = getVerticalCenter() * pixelsPerInch;
		shapeLength = getHoleLength() * pixelsPerInch;
	} else {
		verticalSpacing = spacing;
		shapeLength = shapeWidth;
	}

	var shapes = generateVectors(ctx, width, height, shapeWidth,
		shapeLength, spacing, pixelsPerInch, selectedShape, selectedAlignment, margin, verticalSpacing, isPdf);

	calculateOpenArea(shapes);
}

function generateVectors(ctx, width, height, shapeWidth, shapeLength, 
	spacing, pixelsPerInch, selectedShape, selectedAlignment, margin, verticalSpacing, isPdf) {
	ctx.moveTo(0, 0);

	ctx.fillStyle = "#000000";

	var startingCenterX = margin + (shapeWidth / 2),
		startingCenterY = margin + (shapeWidth / 2);

	var currentCenterX = startingCenterX,
		currentCenterY = startingCenterY;
	var row = 0;
	var shapes = 0;
	

	while (currentCenterY < (height - (shapeLength / 2) - margin)) {

		if (selectedShape === "circle") {
			drawCircle(ctx, currentCenterX, currentCenterY, shapeWidth, isPdf);
		} else if (selectedShape === "square") {
			drawSquare(ctx, currentCenterX, currentCenterY, shapeWidth, isPdf);
		} else if (selectedShape === "obround") {
			drawObround(ctx, currentCenterX, currentCenterY, shapeWidth, shapeLength, isPdf);
		} else if (selectedShape === "hex") {
			drawHexagon(ctx, currentCenterX, currentCenterY, shapeWidth, isPdf);
		} else if (selectedShape === "rectangle") {
			drawRectangle(ctx, currentCenterX, currentCenterY, shapeWidth, shapeLength, isPdf);
		}
		shapes++;

		// move to the next hole over
		currentCenterX = currentCenterX + spacing;
		// length=overlapping shapes move two holes over
		if ((selectedShape === "obround") || (selectedShape === "rectangle")) {
			currentCenterX = currentCenterX + spacing;
		}

		// move to the next row if we hit the end of the sheet
		if ((currentCenterX + (shapeWidth / 2)) >= (width - margin)) {
			if ((selectedShape === "obround") || (selectedShape === "rectangle")) {
				if (selectedAlignment=== "inline") {
					if ((row % 2) === 1) {
						currentCenterY = currentCenterY + verticalSpacing;
					}
				} else {
					currentCenterY = currentCenterY + (verticalSpacing / 2);
				}
			} else {
				if (selectedAlignment == "staggered60") {
					currentCenterY = currentCenterY + Math.sqrt(Math.pow(spacing, 2) - Math.pow(spacing / 2, 2));
				} else if (selectedAlignment == "staggered45") {
					currentCenterY = currentCenterY + Math.cos(60 * (Math.PI / 180)) * spacing;
				} else {
					currentCenterY = currentCenterY + spacing;
				}
			}

			currentCenterX = startingCenterX;

			if ((row % 2) === 0) {
				if ((selectedShape === "obround") || (selectedShape === "rectangle")) {
					currentCenterX = currentCenterX + spacing;
					currentCenterY = currentCenterY;
				} else if (selectedAlignment == "staggered60") {
					currentCenterX = currentCenterX + (spacing / 2);
				} else if (selectedAlignment == "staggered45") {
					currentCenterX = currentCenterX + spacing / 2;
				}
			}
			row++;
			if (row > 10000) {
				return shapes;
			}
		}
	}

	if (!isPdf) {
	  drawWidthLabel(ctx, startingCenterX, startingCenterY, shapeWidth);
  }
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

function drawSquare(canvasContext, x, y, width, isPdf) {
	var halfWidth = width / 2;
	var startX = x - halfWidth;
	var startY = y - halfWidth;
	if (isPdf) {
		canvasContext.polygon(
			[startX, startY], 
			[startX, startY + width], 
			[startX + width, startY + width], 
			[startX + width, startY]);
		canvasContext.fillAndStroke();
	} else {
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
}

function drawCircle(canvasContext, x, y, diameter, isPdf) {
	var radius = diameter / 2;
	if (isPdf) {
		canvasContext.circle(x + radius, y + radius, radius);
		canvasContext.fillAndStroke();
	} else {
		canvasContext.beginPath();
		canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
		canvasContext.stroke();
		canvasContext.fill();
	}
}

function drawObround(canvasContext, x, y, diameter, length, isPdf) {
	var radius = diameter / 2;
	var linearLength = length - diameter;
	if (isPdf) {
		canvasContext.arc(x, y, radius, Math.PI, 0, false);
		canvasContext.lineTo(x + radius, y + linearLength);
		canvasContext.arc(x, y + linearLength, radius, 0, Math.PI, false);
		canvasContext.lineTo(x - radius, y);
		canvasContext.fillAndStroke();
	} else {	
		canvasContext.beginPath();
		canvasContext.arc(x, y, radius, Math.PI, 0);
		canvasContext.lineTo(x + radius, y + linearLength);
		canvasContext.arc(x, y + linearLength, radius, 0, Math.PI);
		canvasContext.lineTo(x - radius, y);
		canvasContext.closePath();
		canvasContext.fill();
		canvasContext.stroke();
	}
}

function drawHexagon(canvasContext, x, y, width, isPdf) {
	var hexHeight = getHexHeight(width),
		hexRadius = getHexRadius(width),
		hexRectangleHeight,
		hexRectangleWidth,
		hexagonAngle = 30 * (Math.PI / 180), // 0.523598776, // 30 degrees in radians
		sideLength = getHexSideLength(width);

	hexRectangleHeight = sideLength + 2 * hexHeight;
	hexRectangleWidth = 2 * hexRadius;
	var hexOutsideRadius = hexRadius / Math.cos(hexagonAngle);

	var startX = x - hexRadius;
	var startY = y - hexOutsideRadius;

	if (isPdf) {
		canvasContext.polygon(
			[startX + hexRadius, startY], 
			[startX + hexRectangleWidth, startY + hexHeight], 
			[startX + hexRectangleWidth, startY + hexHeight + sideLength], 
			[startX + hexRadius, startY + hexRectangleHeight], 
			[startX, startY + sideLength + hexHeight], 
			[startX, startY + hexHeight]);
		canvasContext.fillAndStroke();
	} else {
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
}

function getHexHeight(width) {
	var hexagonAngle = 30 * (Math.PI / 180), // 0.523598776, // 30 degrees in radians
	sideLength = getHexSideLength(width);

	return Math.sin(hexagonAngle) * sideLength;
}

function getHexRadius(width) {
	var hexagonAngle = 30 * (Math.PI / 180), // 0.523598776, // 30 degrees in radians
	sideLength = getHexSideLength(width);

	return Math.cos(hexagonAngle) * sideLength;
}

function getHexSideLength(width) {
	var hexagonAngle = 30 * (Math.PI / 180); // 0.523598776, // 30 degrees in radians
	return 2 * Math.tan(hexagonAngle) * (width / 2);
}

function drawRectangle(canvasContext, x, y, width, length, isPdf) {
	var halfWidth = width / 2;
	var halfLength = length / 2;
	var startX = x - halfWidth;
	var startY = y - halfWidth; // start position is minus 1/2 width
	if (isPdf) {
		canvasContext.polygon([startX, startY], 
			[startX, startY + length], 
			[startX + width, startY + length], 
			[startX + width, startY]);
		canvasContext.fillAndStroke();
	} else {
		canvasContext.beginPath();
		canvasContext.moveTo(startX, startY);
		canvasContext.lineTo(startX, startY + length);
		canvasContext.lineTo(startX + width, startY + length);
		canvasContext.lineTo(startX + width, startY);
		canvasContext.lineTo(startX, startY);
		canvasContext.closePath();
		canvasContext.fill();
		canvasContext.stroke();
	}
}

function calculateOpenArea(shapes) {
	var shape = getSelectedShape();
	var sheetSqIn = getSheetWidth() * getSheetLength();
	console.log("horiz: " + getHorizontalCenter());
	console.log("vertz: " + getVerticalCenter());
	var shapeSurround = getHorizontalCenter() * getVerticalCenter();
	var shapeArea;

	if (shape === "circle") {
		shapeArea = Math.PI * Math.pow(getHoleWidth() / 2, 2);
		if (getSelectedAlignment() === "staggered45") {
			shapeSurround = getHorizontalCenter() * getHorizontalCenter() * 0.5 * Math.tan(45 * (Math.PI / 180));
		} else if (getSelectedAlignment() === "staggered60") {
			shapeSurround = getHorizontalCenter() * getHorizontalCenter() * 0.5 * Math.tan(60 * (Math.PI / 180));
		}
	} else if (shape === "square") {
		shapeArea = Math.pow(getHoleWidth(), 2);
	} else if (shape === "hex") {
		var hexRadius = getHoleWidth() / 2;
		var hexagonAngle = 30 * (Math.PI / 180);
		var hexOutsideRadius = hexRadius / Math.cos(hexagonAngle);
		shapeArea = ((3 * Math.sqrt(3)) / 2) * Math.pow(hexOutsideRadius, 2);
		if (getSelectedAlignment() === "staggered45") {
			shapeSurround = getHorizontalCenter() * getHorizontalCenter() * 0.5 * Math.tan(45 * (Math.PI / 180));
		} else if (getSelectedAlignment() === "staggered60") {
			shapeSurround = getHorizontalCenter() * getHorizontalCenter() * 0.5 * Math.tan(60 * (Math.PI / 180));
		}
	} else if (shape === "obround") {
		// circular ends
		shapeArea = Math.PI * Math.pow(getHoleWidth() / 2, 2);
		// rectangular center
		shapeArea = shapeArea + (getHoleWidth() * (getHoleLength() - getHoleWidth()));
	} else if (shape === "rectangle") {
		shapeArea = getHoleWidth() * getHoleLength();
	}
	
	console.log("disp: " + shapeSurround + " shape: " + shapeArea);

	var openArea = shapeArea / shapeSurround;

	var openAreaDisplay = openArea * 100;
	openAreaDisplay = Math.round(openAreaDisplay, 0);
	document.getElementById("openArea").value = openAreaDisplay + "%";
}
