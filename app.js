const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 400;

function createChart(data) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.style.border = data.styles.chartBorder;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const canvasData = computeCanvasData(data.charts);

  drawGrid(ctx, canvasData, data.charts);

  document.querySelector(".chart-container").appendChild(canvas);
}

createChart(getChartData());

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
  charts
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

  drawAxes(ctx, xShift * scaleX, yShift * scaleY);

  const canvasCoords = [];

  charts.forEach((chart) => {
    // dec coords to canvas coords
    for (const [x, y] of chart[1]) {
      canvasCoords.push([
        xShift * scaleX + (x * scaleX) / xRatio,
        yShift * scaleY - (y * scaleY) / yRatio,
      ]);
    }
    drawGraph(ctx, canvasCoords);
  });
}

function drawAxes(ctx, xAxisCenter, yAxisCenter) {
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
}

function computeBoundaries(charts) {
  let xMin, xMax, yMin, yMax;

  const yCoords = [];
  const xCoords = [];

  charts.forEach((chart) => {
    for (const [x, y] of chart[1]) {
      xCoords.push(x);
      yCoords.push(y);
    }
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
