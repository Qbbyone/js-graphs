//const canvas = document.getElementById("canvas");
//const ctx = canvas.getContext("2d");

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;

const scaleX = 25;
const scaleY = 25;

const xAxisCenter = Math.round(CANVAS_WIDTH / scaleX / 2) * scaleX;
const yAxisCenter = Math.round(CANVAS_HEIGHT / scaleY / 2) * scaleY;

function createChart(data) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  // canvas.style.width = CANVAS_WIDTH + "px";
  // canvas.style.height = CANVAS_HEIGHT + "px";
  canvas.style.border = data.styles.chartBorder;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const [xMin, xMax, yMin, yMax] = computeBoundaries(data);

  drawGrid(ctx);
  drawAxes(ctx);

  data.charts.forEach((chart) => {
    // const name = line[0] здесь может быть имя графика 1:07:27
    const decCoords = [];

    // canvas coords to decards coords
    for (const [x, y] of chart[1]) {
      decCoords.push([xAxisCenter + (x * scaleX), yAxisCenter - y * scaleY]);
    }
    console.log(decCoords)
    drawGraph(ctx, decCoords);
  });

  document.querySelector(".chart-container").appendChild(canvas);
}

createChart(getChartData());

//сетка
function drawGrid(ctx) {
  ctx.font = `${Math.round(scaleX / 3)}px Arial`;
  ctx.strokeStyle = "f5f0e8";
  ctx.textBaseline = "top";

  ctx.beginPath();
  ctx.strokeStyle = "#bbb";
  ctx.lineWidth = 0.5;

  for (let i = 0; i < CANVAS_WIDTH; i += scaleX) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i, CANVAS_HEIGHT);
    ctx.fillText((i - xAxisCenter) / scaleX, i + 5, yAxisCenter + 5);
  }

  for (let i = 0; i < CANVAS_HEIGHT; i += scaleY) {
    ctx.moveTo(0, i);
    ctx.lineTo(CANVAS_WIDTH, i);
    ctx.fillText((yAxisCenter - i) / scaleY, xAxisCenter + 5, i + 5);
  }

  ctx.stroke();
  ctx.closePath();
}

// главные оси
function drawAxes(ctx) {
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
  // for (let i = 0; i <= CANVAS_WIDTH; i++) {
  //   const x = (i - xAxisCenter) / scaleX;
  //   const y = Math.pow(x, 2);
  //   ctx.fillRect(x * scaleX + xAxisCenter, yAxisCenter - scaleY * y, 4, 4);
  // }

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
