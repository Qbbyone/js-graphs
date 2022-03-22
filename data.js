/**
 *  @constant
 *  @default
 */
const CHARTS_NUMBER = 3;
const NODES_NUMBER = 4;
const numberVariants = ["positive", "negative"];
const ranges = [10, 100];

/**
 * Get all necessary data for creating chart
 * @return {object} chart data.
 */
function getChartData() {
  const chartData = {
    charts: [],
    styles: {
      chartBorder: "1px solid #bbb",
      rowsColor: "#bbb",
      rowLineWidth: 0.5,
      graphLineWidth: 4,
      font: "12px Arial",
      fontColor: "#96a2aa",
    },
    axesNames: {
      x: "axis_x",
      y: "axis_y",
    },
  };

  for (let i = 1; i <= CHARTS_NUMBER; i++) {
    const chart = {
      chartName: `chart_${i}`,
      lineColor: getRandomLineColor(chartData.charts),
      coordinates: getChartCoordinates(),
    };
    chartData.charts.push(chart);
  }

  return chartData;
}

/**
 * Get random chart coordinates for testing
 * @return {Array.<number>} x and y coordinates.
 */
function getChartCoordinates() {
  let coordinates = [];

  for (let i = 0; i < NODES_NUMBER; i++) {
    coordinates.push([
      getTestCoordinates(
        ranges[Math.floor(Math.random() * ranges.length)],
        numberVariants[Math.floor(Math.random() * numberVariants.length)]
      ),
      getTestCoordinates(
        ranges[Math.floor(Math.random() * ranges.length)],
        numberVariants[Math.floor(Math.random() * numberVariants.length)]
      ),
    ]);
  }

  return coordinates;
}

/**
 * Get random graph line hex color for testing
 * @param {Array.<Object>} charts - list of charts to check if the random color is unique.
 * @return {string} hex formated color
 */
function getRandomLineColor(charts) {
  let color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  charts.forEach((chart) => {
    if (color === chart.lineColor) {
      color = getRandomLineColor(chartData);
    }
  });
  return color;
}

/**
 * Get random coordinate value 
 * @param {number} range - limit of Math.random function 
 * @param {string} variant - positive or negative 
 * @return {number} random coordinate value 
 */
function getTestCoordinates(range, variant) {
  let randomNum = parseFloat(Math.random() * range).toFixed(3);
  if (variant === "negative") {
    randomNum *= -1;
  }
  return randomNum;
}
