const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 400;

const chartContainer = document.querySelector(".chart-container");

const message = document.createElement("div");

function root(data) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.style.border = data.styles.chartBorder;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const coords = data.charts
    .map((chart) => chart.coordinates)
    .reduce((prev, current) => [...prev, ...current]);

  const canvasData = computeCanvasData(coords);

  drawGrid(ctx, canvasData, data);
  drawAxes(ctx, canvasData);

  data.charts.forEach(
    (chart) =>
      (chart.canvasCoordinates = computeCanvasCoords(
        chart.coordinates,
        canvasData
      ))
  );

  data.charts.forEach((chart) => drawGraph(ctx, chart.canvasCoordinates));

  chartContainer.appendChild(canvas);

  canvas.addEventListener(
    "mousemove",
    mousemove.bind(null, canvas, data.charts)
  );
}

root(getChartData());

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

function computeCanvasData(charts) {
  const [xMin, xMax, yMin, yMax] = computeBoundaries(charts);

  let [xShift, xSteps, xRatio] = getDistance(xMin, xMax);
  let [yShift, ySteps, yRatio] = getDistance(yMin, yMax);

  const scaleX = CANVAS_WIDTH / xSteps;
  const scaleY = CANVAS_HEIGHT / ySteps;
  return {
    xRatio,
    yRatio,
    xShift,
    yShift: ySteps - yShift,
    scaleX,
    scaleY,
  };
}

function drawGrid(
  ctx,
  { xRatio, yRatio, xShift, yShift, scaleX, scaleY },
  data
) {
  ctx.font = "12px Arial";
  ctx.strokeStyle = "f5f0e8";
  ctx.textBaseline = "top";

  ctx.beginPath();
  ctx.strokeStyle = "#bbb";
  ctx.lineWidth = 0.5;

  for (let i = 0; i < CANVAS_WIDTH; i += scaleX) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i, CANVAS_HEIGHT);
    ctx.fillText(
      Math.round((-xShift + i / scaleX) * xRatio),
      i + 2,
      yShift * scaleY + 2
    );
  }

  for (let i = 0; i < CANVAS_HEIGHT; i += scaleY) {
    ctx.moveTo(0, i);
    ctx.lineTo(CANVAS_WIDTH, i);
    ctx.fillText(
      Math.round((yShift - i / scaleY) * yRatio),
      xShift * scaleX + 2,
      i + 2
    );
  }

  ctx.stroke();
  ctx.closePath();
}

function drawAxes(ctx, canvasData) {
  const xAxisCenter = canvasData.scaleX * canvasData.xShift;
  const yAxisCenter = canvasData.scaleY * canvasData.yShift;

  ctx.beginPath();
  ctx.strokeStyle = "black";

  ctx.moveTo(xAxisCenter, 0);
  ctx.lineTo(xAxisCenter, CANVAS_HEIGHT);
  ctx.fillText("y", xAxisCenter - 20, 0);

  ctx.moveTo(0, yAxisCenter);
  ctx.lineTo(CANVAS_WIDTH, yAxisCenter);
  ctx.fillText("x", CANVAS_WIDTH - 20, yAxisCenter);

  ctx.stroke();
  ctx.closePath();
}

function drawGraph(ctx, canvasCoords) {
  ctx.beginPath();

  // styling graphics line
  ctx.lineWidth = 4;
  ctx.strokeStyle = "green";

  for (const [x, y] of canvasCoords) {
    ctx.lineTo(x, y);
  }

  ctx.stroke();
  ctx.closePath();

  for (const [x, y] of canvasCoords) {
    drawNode(ctx, x, y);
  }
}

function drawNode(ctx, x, y) {
  const CIRCLE_RADIUS = 3;
  ctx.beginPath();
  ctx.strokeStyle = "green";
  ctx.fillStyle = "green";
  ctx.arc(x, y, CIRCLE_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}

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

function computeSteps(absSum) {
  let steps = 0;
  let ratio = 0;

  const ratios = [1, 2, 5];

  let exp = 0;
  let exit_loops = false;

  while (!exit_loops) {
    for (let i = 0; i < ratios.length; i++) {
      ratio = ratios[i] * Math.pow(10, exp);
      steps = Math.ceil(absSum / ratio);
      if (steps <= 10) {
        steps += 2;
        exit_loops = true;
        return [steps, ratio];
      }
    }
    ++exp;
  }
}

function getDistance(min, max) {
  let distance = 0;
  let shift = 0;
  let steps = 0;
  let ratio = 0;

  if (min < 0 && max < 0) {
    distance = Math.abs(min);
    [steps, ratio] = computeSteps(distance);
    shift = Math.ceil(distance / ratio) + 1;
  } else if (min > 0 && max > 0) {
    distance = max;
    [steps, ratio] = computeSteps(distance);
    shift = 1;
  } else {
    distance = Math.abs(min) + Math.abs(max);
    [steps, ratio] = computeSteps(distance);
    shift = Math.ceil(Math.abs(min) / ratio) + 1;
  }

  return [shift, steps, ratio];
}

// message
function showNodeMessage(x, y, chartName, [xDec, yDec]) {
  message.id = "message";
  message.classList.remove("hidden");
  message.classList.add("chart-message");
  message.style.top = y + 30 + "px";
  message.style.left = x - 10 + "px";

  message.innerText = `${chartName}\nx = ${xDec},\n y = ${yDec}`;

  chartContainer.appendChild(message);
}

function clearMessage() {
  message.classList.add("hidden");
}
