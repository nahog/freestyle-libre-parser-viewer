(function() {
    'use strict';

    // TODO: Make these values UI configurable
    var HIPO_LIMIT = 4.0;
    var HIPER_LIMIT = 10.0;

    $('#file').change(function(evt) {
        var file = evt.target.files[0]; // FileList object
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function() {

            // Create the report

            var report = FreeStyleLibreLib.parseReport(reader.result);

            // Define series and properties

            var highchartsData = [
                {
                    name: 'Glucose', 
                    color: '#FA5858', 
                    data: [],
                    zones: [
                        {
                            color: '#FA5858',
                            value: HIPO_LIMIT
                        },
                        {
                            color: '#190707',
                            value: HIPER_LIMIT
                        },
                    ]
                },
                {
                    name: 'Rapid-Acting Insulin',
                    color: '#FAAC58',
                    data: []
                },
                {
                    name: 'Long-Acting Insulin', 
                    color: '#BE81F7', 
                    data: [] 
                },  
                {
                    name: 'Food',
                    color: '#000099',
                    data: [],
                    lineWidth: 0,
                    marker: {
                        enabled: true,
                        radius: 4
                    }
                },   
                {
                    name: 'Rapid-Acting Insulin Injection',
                    color: '#FAAC58',
                    data: [],
                    lineWidth: 0,
                    marker: {
                        enabled: true,
                        radius: 4
                    }
                },       
                { 
                    name: 'Long-Acting Insulin Injection', 
                    color: '#BE81F7', 
                    data: [], 
                    lineWidth: 0, 
                    marker: {
                        enabled: true, 
                        radius: 4
                    } 
                },        
                { 
                    name: 'Hypo', 
                    color: '#F5A9A9', 
                    dashStyle: 'ShortDash', 
                    data: []
                },
                { 
                    name: 'Hyper', 
                    color: '#F5A9A9', 
                    dashStyle: 'ShortDash', 
                    data: []
                }
            ];

            // Add data points

            report.glucose.forEach(function(element) {
                var value = element.glucose.getValueAsMmolPerL();
                highchartsData[0].data.push([element.date.valueOf(), value]);
            }, this);
            report.getSmoothRapidInsulin().forEach(function(element) {
                var value = element.units;
                highchartsData[1].data.push([element.date.valueOf(), value]);
            }, this);
            report.getSmoothLongInsulin().forEach(function(element) {
                var value = element.units;
                highchartsData[2].data.push([element.date.valueOf(), value]);
            }, this);
            report.food.forEach(function(element) {
                var value = element.carbs;
                highchartsData[3].data.push([element.date.valueOf(), (isNaN(value) ? 5 : value)]);
            }, this);
            report.insulin.forEach(function(element) {
                var value = element.units;
                if (element.insulinType == 0) {
                    highchartsData[4].data.push([element.date.valueOf(), value]);
                }
                if (element.insulinType == 1) {
                    highchartsData[5].data.push([element.date.valueOf(), value]);
                }
            }, this);
            highchartsData[6].data = [
                [report.start.valueOf(), HIPO_LIMIT],
                [report.end.valueOf(), HIPO_LIMIT]
            ];
            highchartsData[7].data = [
                [report.start.valueOf(), HIPER_LIMIT],
                [report.end.valueOf(), HIPER_LIMIT]
            ];

            // Create the Highcharts chart

            Highcharts.stockChart('container', {
                series: highchartsData,
                rangeSelector: {
                    selected: 1,
                    buttons: [{
                        type: 'day',
                        count: 1,
                        text: '1d'
                    }, {
                        type: 'day',
                        count: 3,
                        text: '3d'
                    }, {
                        type: 'day',
                        count: 7,
                        text: '1w'
                    }, {
                        type: 'month',
                        count: 1,
                        text: '1m'
                    }, {
                        type: 'month',
                        count: 3,                        
                        text: '3m'
                    }, {
                        type: 'all',
                        text: 'All'
                    }]
                },
                legend: {
                    enabled: true,
                    layout: 'vertical',
                    backgroundColor: '#FFFFFF',
                    align: 'right',
                    x: -30,
                    y: 50, 
                    verticalAlign: 'top',
                    floating: true,
                    shadow: true
                },
            });
        };
    });
})();