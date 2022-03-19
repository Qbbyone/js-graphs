const CHARTS_NUMBER = 1;

function getChartData() {
  const chartData = {
    charts: [],
    styles: {
      chartBorder: "1px solid#bbb",
      lineColor: "green",
      rowsColor: "#bbb",
      rowLineWidth: 0.5,
      graphLineWidth: 4,
      font: "normal 20px Arial",
      fontColor: "#96a2aa",
    },
  };

  for (let i = 1; i <= CHARTS_NUMBER; i++) {
    const chart = [`chart_${i}`, getChartCoordinates()];
    chartData.charts.push(chart);
  }

  return chartData;
}

function getChartCoordinates() {
  // const coordinates = new Map([
  //   [0, 3],
  //   [0, 4]
  // ]);

  let coordinates = [
    [0, 3],
    [0, 9],
  ];
 

  // for (let i = 0; i < 2; i++) {
  //   coordinates.set(
  //     parseFloat(Math.random() * 10).toFixed(0),
  //     parseFloat(Math.random() * 10).toFixed(0)
  //   );
  // }
  
  return coordinates;
}
