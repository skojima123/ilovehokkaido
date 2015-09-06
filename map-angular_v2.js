var module = angular.module('hokkaido_map', []);


module.directive('viewDirective', function () {
    return {
        template: '<h1>MapView</h1>'
    };
});

module.controller('MapCtrl', function ($scope, $http) {

    var colorPaletteNegative = ["#E8EAF6", "#C5CAE9", "#9FA8DA", "#7986CB", "#5C6BC0", "#3F51B5", "#3949AB", "#303F9F", "#283593", "#1A237E"];
    var colorPalettePositive = ["#FFEBEE", "#FFCDD2", "#EF9A9A", "#E57373", "#EF5350", "#F44336", "#E53935", "#D32F2F", "#C62828", "#B71C1C"];

    var m_width = $('#map').width(),
        width = 1000, height = 500;

    var map = d3.select('#map')
        .append('svg')
        .attr('preserveAspectRatio', 'xMidYMid')
        .attr('viewBox', '0 0 ' + width + ' ' + height)
        .attr('width', m_width)
        .attr('height', m_width * height / width);

    var popDeltaHash = d3.map();

    var onMouseOver = function (d) {
        var xy = d3.mouse(document.getElementById('map'));
        //console.log('coordinate: ' + xy);
        var nums = popDeltaHash.get(d.id);
        if (nums !== undefined) {
            var num = nums[1];
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
                    .classed('on-mouse',true)
            }

        }

    }

    var onMouseOut = function () {
        d3.select('#tooltip')
            .classed('hidden', true)
            .text('');
        d3.select(this)
            .classed('on-mouse', false)
    }

    $scope.rowClicked = function (k) {
        console.log("clicked: " + k);
        if (k !== undefined) {
            var pathId = "#" + k;
            d3.selectAll(pathId)
                .classed('on-mouse',true)
        }
    }

    $scope.rowLeft = function (k) {
        if (k !== undefined) {
            var pathId = "#" + k;
            d3.selectAll(pathId)
                .classed('on-mouse',false);
        }
    }

    queue(1)
        .defer(d3.json, "./Hokkaido/hokkaido_v4.topojson")
        .defer(d3.json, "./Hokkaido/hokkaido_population_delta_v2.json")
        .await(ready);


    function ready(error, topo, json) {

        console.log('rendering map');
        $scope.dataSet = json;

        $scope.dataSet.forEach(function (e, i, a) {
            popDeltaHash.set(e.city, [e.population, Number(e.delta).toFixed(1)]);
        });

        $scope.$apply();

        //console.log($scope.dataSet);

        var center = d3.geo.centroid(topojson.feature(topo, topo.objects.hokkaido))
        //console.log(center);
        var projection = d3.geo.mercator()
            .center(center)
            .scale(4500)
            .translate([width / 2, height / 2]);

        var path = d3.geo.path()
            .projection(projection);

        var max = d3.max(popDeltaHash.values(), function (d) {
            return Number(d[1]);
        });
        var min = d3.min(popDeltaHash.values(), function (d) {
            return Number(d[1]);
        });

        var quantizeNegative = d3.scale.quantize()
            .domain([min, 0])
            .range(d3.range(10).map(function(idx){
                return idx;
            }));

        var quantizePositive = d3.scale.quantize()
            .domain([0, max])
            .range(d3.range(10).map(function(idx){
                return idx;
            }));


        map.selectAll(".subunit")
            .data(topojson.feature(topo, topo.objects.hokkaido).features)
            .enter()
            .append("path")
            .attr('id', function (d) {
                return d.id;
            })
            .attr('class', function (d) {
                var val = popDeltaHash.get(d.id);
                if (val !== undefined) {
                    if (val[1]>0){
                        return "subunit p-" + quantizePositive(val[1])
                    } else {
                        return "subunit n-" + quantizeNegative(val[1])
                    }
                }
                return "not-defined";
            })
            .attr('d', path)
            .on('mouseover', onMouseOver)
            .on('mouseout', onMouseOut);


        //legend functions
        var raw_dataset = d3.range(1, 10 + 1);
        var palette = colorPalettePositive.reverse().concat(colorPaletteNegative.reverse())

        var getRangePoints = function () {
            function round(array, dps) {
                return array.map(function (e, i, a) {
                    return Math.round(e * Math.pow(10, dps)) / Math.pow(10, dps);
                })
            }

            var o = d3.scale.ordinal()
                .domain(raw_dataset)
                .rangePoints([0, max]);
            var posRange = round(o.range(), 2).reverse();
            var rangeTxt = []
            for (var i = 0; i < posRange.length; i++) {
                if (i == 0) {
                    rangeTxt.push(posRange[i] + " ~");
                    continue
                }
                rangeTxt.push(posRange[i] + " ~ " + posRange[i - 1]);
            }
            var o1 = d3.scale.ordinal()
                .domain(raw_dataset)
                .rangePoints([min, 0]);
            var negRange = round(o1.range(), 2).reverse();
            for (var i = 0; i < negRange.length; i++) {
                if (negRange[i + 1] == undefined) {
                    rangeTxt.push(negRange[i] + " ~");
                    break;
                }
                rangeTxt.push(negRange[i] + " ~ " + negRange[i + 1]);
            }
            return rangeTxt;
        }

        var pts = getRangePoints();

        map.append("text")
            .attr('class', 'legend')
            .attr({
                fill: 'black',
                x: 30,
                y: 20})
            .text('人口増減率(%) 2007~2012');

        // add legend to map svg
        var legend = map.append('g')
            .attr('class', 'legend')
            .attr('transform', 'translate(15,10)');

        legend.selectAll('rect')
            .data(pts)
            .enter()
            .append('rect')
            .attr('class', function (d, i) {
                return 'sublabel-' + i.toString();
            })
            .attr({
                x: 0,
                y: function (d, i) {
                    //console.log(i);
                    return (i + 1) * 20;
                },
                width: 20,
                height: 10,
                fill: function (d, i) {
                    //console.log(palette[i])
                    return palette[i];
                }
            })
            .style('stroke', 'white')
            .style('stroke-width', 1);

        legend.selectAll('text')
            .data(pts)
            .enter()
            .append('text')
            .attr('class', function (d, i) {
                return 'subunit-' + i.toString();
            })
            .attr({
                x: 20 + 2,
                y: function (d, i) {
                    return (i + 1) * 20 + 10;
                }
            })
            .text(function (d) {
                return d.toString();
            });
    }

});