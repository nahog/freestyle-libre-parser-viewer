(function() {
    'use strict';

    $('#file').change(function(evt) {
        var file = evt.target.files[0]; // FileList object
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function() {

            // Create the report

            var report = FreeStyleLibreLib.parseReport(reader.result);

            // Add data points (only first 100 points)

            var data = [];
            report.glucose.slice(0, 99).forEach(function(element) {
                var value = element.glucose.getValueAsMmolPerL();
                data.push({x: element.date.format(), y: value});
            }, this);

            // Create the ChartJS chart

            var color = Chart.helpers.color;
            var config = {
                type: 'line',
                data: {
                    datasets: [
                        {
                            label: 'Glucose', 
                            backgroundColor: color('rgb(255, 99, 132)').alpha(0.5).rgbString(),
                            borderColor: 'rgb(255, 99, 132)',
                            fill: false,
                            data: data
                        }
                    ]
                },
                options: {
                    responsive: true,
                    title:{
                        display: true,
                        text:"Freestyle Libre Parser/Viewer - ChartJS example"
                    },
                    scales: {
                        xAxes: [{
                            type: "time",
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Date'
                            },
                            ticks: {
                                major: {
                                    fontStyle: "bold",
                                    fontColor: "#FF0000"
                                }
                            }
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'value'
                            }
                        }]
                    }
                }
            };

            console.log(config);

			new Chart(document.getElementById("canvas").getContext("2d"), config);
        };
    });
})();