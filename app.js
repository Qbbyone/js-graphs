/**
 *  @default
 */
let canvasWidth = window.innerWidth - 200;
let canvasHeight = window.innerHeight - 200;

const chartContainer = document.querySelector(".chart-container");
const message = document.createElement("div");

init(getChartData());

/**
 * init application by creating canvas element and adding event listeners
 * @param {object} data - data for creating chart
 */
function init(data) {
  const canvas = document.createElement("canvas");

  canvas.addEventListener(
    "mousemove",
    mousemove.bind(null, canvas, data.charts)
  );

  window.addEventListener("resize", render.bind(null, canvas, data));

  render(canvas, data);

  chartContainer.appendChild(canvas);
}

/**
 * Render canvas every time page resizes
 * @param {Object} canvas - HTML canvas element
 * @param {Object} data - data for creating chart
 */
function render(canvas, data) {
  const ctx = canvas.getContext("2d");

  let maxStepNumber;

  if (window.innerWidth < 700) {
    canvasWidth = window.innerWidth - 120;
    canvasHeight = window.innerHeight - 120;
    maxStepNumber = 5;
  } else {
    maxStepNumber = 10;
    canvasWidth = window.innerWidth - 200;
    canvasHeight = window.innerHeight - 200;
  }

  canvas.style.border = data.styles.chartBorder;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const coords = data.charts
    .map((chart) => chart.coordinates)
    .reduce((prev, current) => [...prev, ...current]);

  const canvasData = computeCanvasData(coords, maxStepNumber);

  data.charts.forEach(
    (chart) =>
      (chart.canvasCoordinates = computeCanvasCoords(
        chart.coordinates,
        canvasData
      ))
  );

  drawGrid(ctx, canvasData, data.styles);
  drawAxes(ctx, canvasData, data.axesNames);
  data.charts.forEach((chart) =>
    drawGraph(ctx, chart.canvasCoordinates, chart.lineColor)
  );
}

/**
 * Get client coordinates to show message when mouse hovers over the graph node
 * @param {Object} canvas - HTML canvas element
 * @param {Array.<Object>} charts - list of charts
 */
function mousemove(canvas, charts, event) {
  clearMessage();
  const { left, top } = canvas.getBoundingClientRect();

  const cursorX = event.clientX - left;
  const cursorY = event.clientY - top;

  charts.forEach((chart) => {
    for (let i = 0; i < chart.canvasCoordinates.length; i++) {
      let [x, y] = chart.canvasCoordinates[i];
      if (
        cursorX >= x - 5 &&
        cursorX <= x + 5 &&
        cursorY >= y - 5 &&
        cursorY <= y + 5
      ) {
        showNodeMessage(x, y, chart.chartName, chart.coordinates[i]);
        return;
      }
    }
  });
}

/**
 * Get coordinates transformed into canvas scaled values
 * @param {Array.<Array>} coordinates - user coordinates in the Cartesian coordinate system
 * @param {Object} canvasData - result of calculation ratios
 * @return {Array.<Array>} canvas scaled coordinates
 */
function computeCanvasCoords(coordinates, canvasData) {
  const canvasCoords = [];
  coordinates.forEach(([x, y]) => {
    canvasCoords.push([
      canvasData.xShift * canvasData.scaleX +
        (x * canvasData.scaleX) / canvasData.xRatio,
      canvasData.yShift * canvasData.scaleY -
        (y * canvasData.scaleY) / canvasData.yRatio,
    ]);
  });
  return canvasCoords;
}

/**
 * Get ratios to scale coordinates into canvas coordinates and shift axes
 * @param {Array.<Object>} charts - list of charts
 * @param {number} maxStepNumber - maximum steps amount to draw grid
 * @return {Object} ratios to scale coordinates
 */
function computeCanvasData(charts, maxStepNumber) {
  const [xMin, xMax, yMin, yMax] = computeBoundaries(charts);

  let [xShift, xSteps, xRatio] = getDistance(xMin, xMax, maxStepNumber);
  let [yShift, ySteps, yRatio] = getDistance(yMin, yMax, maxStepNumber);

  const scaleX = canvasWidth / xSteps;
  const scaleY = canvasHeight / ySteps;
  return {
    xRatio,
    yRatio,
    xShift,
    yShift: ySteps - yShift,
    scaleX,
    scaleY,
  };
}

/**
 * Draw dynamic grid
 * @param {Object} ctx - canvas context object
 * @param {Object} canvasData - ratios to scale coordinates
 * @param {Object} styles - default styles from chartData
 */
function drawGrid(
  ctx,
  { xRatio, yRatio, xShift, yShift, scaleX, scaleY },
  styles
) {
  ctx.font = styles.font;
  ctx.textBaseline = "top";

  ctx.beginPath();
  ctx.strokeStyle = styles.rowsColor;
  ctx.lineWidth = 0.5;

  for (let i = 0; i < canvasWidth; i += scaleX) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvasHeight);
    ctx.fillText(
      Math.round((-xShift + i / scaleX) * xRatio),
      i + 2,
      yShift * scaleY + 2
    );
  }

  for (let i = 0; i < canvasHeight; i += scaleY) {
    ctx.moveTo(0, i);
    ctx.lineTo(canvasWidth, i);
    ctx.fillText(
      Math.round((yShift - i / scaleY) * yRatio),
      xShift * scaleX + 2,
      i + 2
    );
  }

  ctx.stroke();
  ctx.closePath();
}

/**
 * Draw dynamic axes
 * @param {Object} ctx - canvas context object
 * @param {Object} canvasData - ratios to scale coordinates
 * @param {Object} axesNames - default axes names from chartData
 */
function drawAxes(ctx, canvasData, axesNames) {
  const xAxisCenter = canvasData.scaleX * canvasData.xShift;
  const yAxisCenter = canvasData.scaleY * canvasData.yShift;

  ctx.beginPath();
  ctx.strokeStyle = "black";

  ctx.moveTo(xAxisCenter, 0);
  ctx.lineTo(xAxisCenter, canvasHeight);
  if (xAxisCenter < canvasWidth / 2) {
    ctx.fillText(axesNames.y, xAxisCenter + 20, 10);
  } else {
    ctx.fillText(axesNames.y, xAxisCenter - 50, 10);
  }

  ctx.moveTo(0, yAxisCenter);
  ctx.lineTo(canvasWidth, yAxisCenter);
  if (xAxisCenter < canvasWidth / 2) {
    ctx.fillText(axesNames.x, canvasWidth - 50, yAxisCenter - 20);
  } else {
    ctx.fillText(
      axesNames.x,
      canvasWidth - (canvasWidth - 20),
      yAxisCenter - 20
    );
  }

  ctx.stroke();
  ctx.closePath();
}

/**
 * Draw graph line connecting canvas coordinates
 * @param {Object} ctx - canvas context object
 * @param {Array.<Array>} canvasCoords - canvas coordinates calculated from Cartesian coordinates
 * @param {string} color - graph line color
 */
function drawGraph(ctx, canvasCoords, color) {
  ctx.beginPath();

  ctx.lineWidth = 4;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const [x, y] of canvasCoords) {
    ctx.lineTo(x, y);
  }

  ctx.stroke();
  ctx.closePath();

  for (const [x, y] of canvasCoords) {
    drawNode(ctx, x, y, color);
  }
}

/**
 * Draw graph node (dot)
 * @param {Object} ctx - canvas context object
 * @param {number} x - canvas x coordinate
 * @param {number} y - canvas y coordinate
 * @param {string} color - node color
 */
function drawNode(ctx, x, y, color) {
  const CIRCLE_RADIUS = 3;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.arc(x, y, CIRCLE_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}

/**
 * Compute max and min values of x and y of all charts from chartData
 * @param {Array.<Array>} charts - Cartesian client's coordinates from chartData
 * @return {Array.<number>} - four values of max/min x and y
 */
function computeBoundaries(charts) {
  let xMin, xMax, yMin, yMax;
 
  const yCoords = [];
  const xCoords = [];

  charts.forEach(([x, y]) => {
    xCoords.push(x);
    yCoords.push(y);
  });

  xMin = Math.min.apply(null, xCoords);
  xMax = Math.max.apply(null, xCoords);
  yMin = Math.min.apply(null, yCoords);
  yMax = Math.max.apply(null, yCoords);

  return [xMin, xMax, yMin, yMax];
}

/**
 * Get distance between min and max values by calculating Abs sum
 * @param {number} min - min value
 * @param {number} max - max value
 * @param {number} maxmaxStepNumber - max value of steps for different screen sizes
 * @return {Array.<number>} - three values of axes shift, amount of grod steps (rows), ratio of a step
 */
function getDistance(min, max, maxStepNumber) {
  let distance = 0;
  let shift = 0;
  let steps = 0;
  let ratio = 0;

  if (min < 0 && max < 0) {
    distance = Math.abs(min);
    [steps, ratio] = computeSteps(distance, maxStepNumber);
    shift = Math.ceil(distance / ratio) + 1;
  } else if (min > 0 && max > 0) {
    distance = max;
    [steps, ratio] = computeSteps(distance, maxStepNumber);
    shift = 1;
  } else {
    distance = Math.abs(min) + Math.abs(max);
    [steps, ratio] = computeSteps(distance, maxStepNumber);
    shift = Math.ceil(Math.abs(min) / ratio) + 1;
  }

  return [shift, steps, ratio];
}

/**
 * Get amount of steps (row) to draw grid
 * @param {number} absSum - distance between max and min value
 * @param {number} maxmaxStepNumber - max value of steps for different screen sizes
 * @return {Array.<number>} - two values of grid steps and step ratio
 */
function computeSteps(absSum, maxStepNumber) {
  let steps = 0;
  let ratio = 0;

  const ratios = [1, 2, 5];

  let exp = 0;
  let exit_loops = false;

  while (!exit_loops) {
    for (let i = 0; i < ratios.length; i++) {
      ratio = ratios[i] * Math.pow(10, exp);
      steps = Math.ceil(absSum / ratio);
      if (steps <= maxStepNumber) {
        steps += 2;
        exit_loops = true;
        return [steps, ratio];
      }
    }
    ++exp;
  }
}

/**
 * Show message box with node informatiom
 * @param {number} x - max x value of canvas coordinates to position the message box
 * @param {number} y - max y value of canvas coordinates to position the message box
 * @param {string} chartName - name of this node's chart
 * @param {Array.<number>} - Cartesian x and y coordinates of this node to show in message
 */
function showNodeMessage(x, y, chartName, [xText, yText]) {
  message.id = "message";
  message.classList.remove("hidden");
  message.classList.add("chart-message");
  message.style.top = y + 30 + "px";
  message.style.left = x - 10 + "px";

  message.innerText = `${chartName}\nx = ${xText},\n y = ${yText}`;

  chartContainer.appendChild(message);
}

/**
 * Clear message box
 */
function clearMessage() {
  message.classList.add("hidden");
}
