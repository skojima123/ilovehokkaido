var module = angular.module('hokkaido_map', []);


module.directive('viewDirective', function(){
    return {
        template: '<h1>HokkaidoMapView</h1>'
    };
});

module.controller('MapCtrl', function ($scope, $http) {

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




    $scope.populationDeltaChange = d3.map();

    $scope.mapper = {};
    $scope.data = [];

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

            console.log(this);
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
        d3.select(this)
            .attr('fill-opacity', 1.0)
            .style('stroke', 'black')
            .style('stroke-width', 0.1);
    }


    var colorPaletteNegative = ["#E8EAF6", "#C5CAE9", "#9FA8DA", "#7986CB", "#5C6BC0", "#3F51B5", "#3949AB", "#303F9F", "#283593", "#1A237E"];
    var colorPalettePositive = ["#FFEBEE", "#FFCDD2", "#EF9A9A", "#E57373", "#EF5350", "#F44336", "#E53935", "#D32F2F", "#C62828", "#B71C1C"];

    function loader(url, callback){
        $http.get(url)
            .success(function(data,status){
                console.log(data);
                $scope.dataSet = data;

            })
            .error(function(data,status,error){

            });
    };

    queue(1)
        .defer(d3.json, "./Hokkaido/hokkaido_v4.topojson")
        .defer(d3.csv, "./Hokkaido/hokkaido_population_delta.csv", function (d) {
            //console.log(d.delta);
            //$scope.populationDeltaChange.set(d.city, [d.population, Number(d.delta).toFixed(1)]);
            $scope.mapper[d.city]=[d.population, Number(d.delta).toFixed(1)];
        })
        .defer(d3.json, "./Hokkaido/hokkaido_population_delta.json")
        .await(ready);

    $scope.rowClicked = function(k){
        console.log("clicked: "+k);
        if (k!==undefined){
            var pathId = "#"+k;
            d3.selectAll(pathId)
                .attr('fill-opacity', 0.4)
                .style('stroke-width', 1)
                .style('stroke', '#827717');
        }
    }

    $scope.rowLeft = function(k){
        if (k!==undefined){
            var pathId = "#"+k;
            d3.selectAll(pathId)
                .attr('fill-opacity', 1.0)
                .style('stroke', 'black')
                .style('stroke-width', 0.1);
        }
    }

    function ready(error, topo, o1, o2) {

        console.log('rendering map');
        //$scope.mapper = $scope.populationDeltaChange.entries();
        //console.log($scope.mapper);

        //loader("./Hokkaido/hokkaido_population_delta.json")
        $scope.dataSet = o2;

        $scope.dataSet.forEach(function(e,i,a){
            console.log(e);
            $scope.populationDeltaChange.set(e.city, [e.population, Number(e.delta).toFixed(1)]);
        })

        $scope.$apply();

        console.log($scope.dataSet);

        var center = d3.geo.centroid(topojson.feature(topo, topo.objects.hokkaido))
        //console.log(center);
        var projection = d3.geo.mercator()
            .center(center)
            .scale(4500)
            .translate([width / 2, height / 2]);

        var path = d3.geo.path()
            .projection(projection);

        var max = d3.max($scope.populationDeltaChange.values(), function (d) {
            return Number(d[1]);
        });
        var min = d3.min($scope.populationDeltaChange.values(), function (d) {
            return Number(d[1]);
        });

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
            .data(topojson.feature(topo, topo.objects.hokkaido).features)
            .enter()
            .append("path")
            .attr('id', function (d) {
                return d.id;
            })
            .attr('class', function (d) {
                var val = $scope.populationDeltaChange.get(d.id);
                if (val!==undefined){
                    //console.log(val[1]);
                    return "subunit " + quantize(val[1]);
                }
            })
            .style('fill', function (d) {
                var val = $scope.populationDeltaChange.get(d.id);

                if (val===undefined){
                    return "#ddc";
                }
                if (val[1] > 0) {
                    return quantizePositive(val[1]);
                } else {
                    return quantizeNegative(val[1]);
                }

            })
            .attr('d', path)
            .on('mouseover', onMouseOver)
            .on('mouseout', onMouseOut);

    }
});