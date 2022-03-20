const CHARTS_NUMBER = 1;

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
      x: "x",
      y: "y"
    }
  };

  for (let i = 1; i <= CHARTS_NUMBER; i++) {
    const chart = {
      chartName: `chart_${i}`,
      lineColor: "green",
      coordinates: getChartCoordinates()
    }

    chartData.charts.push(chart);
  }

  return chartData;
}

function getChartCoordinates() {
  // const coordinates = new Map();

  let coordinates = [
    [5, 2],
    [-1, 3],
    [2, 6]
  ];

  // for (let i = 0; i < 2; i++) {
  //   coordinates.set(
  //     parseFloat(Math.random() * 10).toFixed(0),
  //     parseFloat(Math.random() * 10).toFixed(0)
  //   );
  // }

  return coordinates;
}
