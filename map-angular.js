var module = angular.module('hokkaido_map', []);

module.controller('MapCtrl', function ($scope, $http) {

    $scope.selectedCity = "***";
    $scope.data = ["旭川市", "根室市", "稚内市"];


    var loadData = function () {
        var uri = "./Hokkaido/hokkaido_population_delta.json";
        $http.get(uri)
            .success(function (data, status) {
                //console.log(data);
                $scope.dataSet = data;

            })
            .error(function (data, status, error) {

            });

    };


    var m_width = $('#map').width(),
        width = 1000,
        height = 500;

    //console.log(m_width);
    var map = d3.select('#map')
        .append('svg')
        .attr('preserveAspectRatio', 'xMidYMid')
        .attr('viewBox', '0 0 ' + width + ' ' + height)
        .attr('width', m_width)
        .attr('height', m_width * height / width);
//.append('g');

//map.append('rect')
//    .attr('class','background')
//    .attr('width',width)
//    .attr('height',height)

//map.append('g')


    $scope.populationById = d3.map()

    $scope.populationDeltaChange = d3.map();

    var onMouseOver = function (d) {
        var xy = d3.mouse(document.getElementById('map'));
        //console.log('coordinate: ' + xy);
        var num = $scope.populationDeltaChange.get(d.id);
        if (num !== undefined) {
            var sign = "+";
            if (num < 0) {
                sign = "";
            }
            d3.select('#tooltip')
                .style('left', (xy[0] + 5) + 'px')
                .style('top', (xy[1] + 5) + 'px')
                .classed('hidden', false)
                //.text(d.id)
                .html("<li>" + d.id + "</li>" +
                "<li>人口推移:" + sign + num.toString() + "%</li>");

            d3.select(this)
                .attr('fill-opacity', 0.4)
                .style('stroke-width', 1)
                .style('stroke', '#827717');
        }

    }

    var onMouseOut = function () {
        d3.select('#tooltip')
            .classed('hidden', true)
            .text('');
        //$(this).attr('border', '1px solid black');
        //$(this).attr("fill-opacity", 1.0);
        d3.select(this)
            .attr('fill-opacity', 1.0)
            .style('stroke', 'black')
            .style('stroke-width', 0.1);
    }


// order light -> dark
    var colorPaletteNegative = ["#E8EAF6", "#C5CAE9", "#9FA8DA", "#7986CB", "#5C6BC0", "#3F51B5", "#3949AB", "#303F9F", "#283593", "#1A237E"];
    var colorPalettePositive = ["#FFEBEE", "#FFCDD2", "#EF9A9A", "#E57373", "#EF5350", "#F44336", "#E53935", "#D32F2F", "#C62828", "#B71C1C"];

    queue(1)
        .defer(d3.json, "./Hokkaido/hokkaido_v4.topojson")
        .defer(d3.tsv, "./Hokkaido/population.tsv", function (d) {
            $scope.populationById.set(d.city_name, d.population)

        })
        .defer(d3.csv, "./Hokkaido/hokkaido_population_delta.csv", function (d) {
            //console.log(d.delta);
            $scope.populationDeltaChange.set(d.city, Number(d.delta).toFixed(1));
        })
        .await(ready);


    function ready(error, o) {
        //console.log(o);
        var center = d3.geo.centroid(topojson.feature(o, o.objects.hokkaido))
        //console.log(center);
        var projection = d3.geo.mercator()
            .center(center)
            .scale(4500)
            .translate([width / 2, height / 2]);

        var path = d3.geo.path()
            .projection(projection);

        var max = d3.max($scope.populationDeltaChange.values(), function (d) {
            return Number(d);
        });
        var min = d3.min($scope.populationDeltaChange.values(), function (d) {
            return Number(d);
        });
        //console.log(maxPopulation);
        //console.log(max);
        //console.log(min);

        var quantize = d3.scale.quantize()
            .domain([min, max])
            .range(d3.range(9).map(function (idx) {
                return "q" + idx + "-9";
            }));

        var quantizePositive = d3.scale.quantize()
            .domain([0, max])
            .range(colorPalettePositive);

        var quantizeNegative = d3.scale.quantize()
            .domain([min, 0])
            .range(colorPaletteNegative.reverse());

        map.selectAll(".subunit")
            .data(topojson.feature(o, o.objects.hokkaido).features)
            .enter()
            .append("path")
            .attr('id', function (d) {
                return d.id;
            })
            .attr('class', function (d) {
                //console.log(quantizev2(populationById.get(d.id)));
                return "subunit " + quantize($scope.populationDeltaChange.get(d.id));
                //return "subunit";
            })
            .style('fill', function (d) {
                var val = $scope.populationDeltaChange.get(d.id);
                if (val > 0) {
                    return quantizePositive(val);
                } else {
                    return quantizeNegative(val);
                }

            })
            .attr('d', path)
            .on('mouseover', onMouseOver)
            .on('mouseout', onMouseOut);

    }
});