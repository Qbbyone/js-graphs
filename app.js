//const canvas = document.getElementById("canvas");
//const ctx = canvas.getContext("2d");

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 400;

// const scaleX = 25;
// const scaleY = 25;

// const xAxisCenter = Math.round(CANVAS_WIDTH / scaleX / 2) * scaleX;
// const yAxisCenter = Math.round(CANVAS_HEIGHT / scaleY / 2) * scaleY;

function createChart(data) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.style.border = data.styles.chartBorder;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  drawGrid(ctx, data);
  
  document.querySelector(".chart-container").appendChild(canvas);
}

createChart(getChartData());

//сетка
function drawGrid(ctx, data) {
  const [xMin, xMax, yMin, yMax] = computeBoundaries(data);

  const [STEPS_X, xRatio] = computeSteps(getAbsSum(xMin, xMax));
  const [STEPS_Y, yRatio] = computeSteps(getAbsSum(yMin, yMax));

  const scaleX = CANVAS_WIDTH / STEPS_X;
  const scaleY = CANVAS_HEIGHT / STEPS_Y;

  console.log("scaleX", scaleX)

  const xAxisCenter = Math.round(CANVAS_WIDTH / scaleX / 2) * scaleX;
  const yAxisCenter = Math.round(CANVAS_HEIGHT / scaleY / 2) * scaleY;

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
      Math.round(((i - xAxisCenter) / scaleX) * xRatio),
      i + 4,
      yAxisCenter + 4
    );
  }

  for (let i = 0; i < CANVAS_HEIGHT; i += scaleY) {
    ctx.moveTo(0, i);
    ctx.lineTo(CANVAS_WIDTH, i);
    ctx.fillText(Math.round(((yAxisCenter - i) / scaleY) * yRatio), xAxisCenter + 4, i + 4);
  }

  ctx.stroke();
  ctx.closePath();

  drawAxes(ctx, xAxisCenter, yAxisCenter);

  data.charts.forEach((chart) => {
    // const name = line[0] здесь может быть имя графика 
    const decCoords = [];

    // canvas coords to decards coords
    for (const [x, y] of chart[1]) {
      decCoords.push([xAxisCenter + x * scaleX, yAxisCenter - y * scaleY]);
    }
    drawGraph(ctx, decCoords);
  });
}

// главные оси
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

// график
function drawGraph(ctx, decCoords) {
  ctx.beginPath();

  // styling graphics line
  ctx.lineWidth = 4;
  ctx.strokeStyle = "green";

  for (const [x, y] of decCoords) {
    ctx.lineTo(x, y);
  }

  ctx.stroke();
  ctx.closePath();
}

function computeBoundaries(data) {
  let xMin, xMax, yMin, yMax;

  const yCoords = [];
  const xCoords = [];

  data.charts.forEach((chart) => {
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
      steps = Math.floor(absSum / ratio);
      if (steps <= 10) {
        steps += 2;
        exit_loops = true;
        return [steps, ratio]; 
      }
    }
    ++exp;
  }
}

function getAbsSum(min, max) {
  return Math.abs(min) + Math.abs(max)
}


