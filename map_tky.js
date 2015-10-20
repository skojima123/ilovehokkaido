/**
 * Created by kojima37 on 6/13/15.
 */





var m_width = $('#map').width(),
    width = 1000,
    height = 500

console.log(m_width);
var map = d3.select('#map')
    .append('svg')
    .attr('preserveAspectRatio', 'xMidYMid')
    .attr('viewBox', '0 0 ' + width + ' ' + height)
    .attr('width', m_width)
    .attr('height', m_width * height / width)


var maxPopulation = 350000;
var minPopulation = 500;

var quantize = d3.scale.quantize()
    .domain([minPopulation, maxPopulation])
    .range(d3.range(9).map(function (idx) {
        return "q" + idx + "-9";
    }));


var quantizev2 = d3.scale.quantize()
    .domain([minPopulation,maxPopulation])
    .range(["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#006d2c","#00441b"]);

var populationById = d3.map();

var onMouseOver = function (d) {
    var xy = d3.mouse(document.body);
    console.log('coordinate: ' + xy);
}

var onMouseOut = function(){
    d3.select('#tooltip')
        .classed('hidden', true)
        .text('');
}

queue()
    .defer(d3.json, "./Tokyo/tokyo.topojson")
    //.defer(d3.tsv, "./Hokkaido/population.tsv", function (d) {
    //    populationById.set(d.city_name, d.population);
    //})
    .await(ready);


function ready(error, o) {
    //console.log(o);
    var center = d3.geo.centroid(topojson.feature(o, o.objects.tokyo))
    //console.log(center);
    var projection = d3.geo.mercator()
        .center(center)
        .scale(15000)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection)

    map.selectAll(".subunit")
        .data(topojson.feature(o, o.objects.tokyo).features)
        .enter().append("path")
        .attr('class', function (d) {
            return 'subunit ' + d.id;
        })
        //.style('fill', 'blue')
        .attr('d', path)
        .on('mouseover', onMouseOver)
        .on('mouseout', onMouseOut);

}

$(window).resize(function () {
    var w = $("#map").width();
    map.attr("width", w);
    map.attr("height", w * height / width * 0.8);
});
