const CHARTS_NUMBER = 3;
const lineColors = {
  red: "#B80D0D",
  green: "#39941C",
  blue: "#5B65A6",
  orange: "#F57401",
  purple: "#68108D",
  teal: "#008080",
  pink: "#FD62FF",
  black: "#101010",
  gray: "#5F5A5A",
};

function getChartData() {
  const chartData = {
    charts: [],
    styles: {
      chartBorder: "1px solid #bbb",
      rowsColor: "#bbb",
      rowLineWidth: 0.5,
      graphLineWidth: 4,
      font: "normal 20px Arial",
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
      lineColor: getRandomLineColor(chartData),
      coordinates: getChartCoordinates(),
    };
    chartData.charts.push(chart);
  }

  return chartData;
}

function getChartCoordinates() {
  // const coordinates = new Map();

  // for (let i = 0; i < 4; i++) {
  //   coordinates.set(
  //     parseFloat(Math.random() * 10).toFixed(0),
  //     parseFloat(Math.random() * 10).toFixed(0)
  //   );
  // }

  let coordinates = [];

  for (let i = 0; i < 4; i++) {
    coordinates.push([
      (parseFloat(Math.random() * 100).toFixed(0)),
      (parseFloat(Math.random() * 10).toFixed(0)),
    ]);
  }

  return coordinates;
}

function getRandomLineColor(chartData) {
  let color =  `#${Math.floor(Math.random()*16777215).toString(16)}`;
  chartData.charts.forEach(chart => {
    if(color === chart.lineColor) {
      color = getRandomLineColor(chartData)
    }
  })
  return color
}
