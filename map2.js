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
//.append('g');

//map.append('rect')
//    .attr('class','background')
//    .attr('width',width)
//    .attr('height',height)

//map.append('g')


var populationById = d3.map();

var onMouseOver = function (d) {
    var xy = d3.mouse(document.body);
    console.log('coordinate: ' + xy);
    d3.select('#tooltip')
        .style('left', (xy[0] + 5) + 'px')
        .style('top', (xy[1] + 5) + 'px')
        .classed('hidden', false)
        //.text(d.id)
        .html("<li>" + d.id + "</li>" +
        "<li>人口:" + populationById.get(d.id) + "</li>")
}

var onMouseOut = function(){
    d3.select('#tooltip')
        .classed('hidden', true)
        .text('');
}


queue()
    .defer(d3.json, "./Hokkaido/hokkaido.topojson")
    .defer(d3.tsv, "./Hokkaido/population.tsv", function (d) {
        populationById.set(d.city_name, d.population);
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



    var populationData = populationById.values();
    //console.log(population);

    var maxPopulation = d3.max(populationData, function(d){
        return Number(d);
    });
    var minPopulation = d3.min(populationData, function(d){
        return Number(d);
    });
    console.log(maxPopulation);

    var quantize = d3.scale.quantize()
        .domain([minPopulation, maxPopulation])
        .range(d3.range(9).map(function (idx) {
            return "q" + idx + "-9";
        }));

    var quantizev2 = d3.scale.quantize()
        .domain([minPopulation,maxPopulation])
        .range(["#E8EAF6", "#C5CAE9", "#9FA8DA", "#7986CB", "#5C6BC0", "#3F51B5", "#3949AB", "#303F9F", "#283593", "#1A237E"]);
    //"#E8F5E9", "#C8E6C9", "#A5D6A7", "#81C784", "#66BB6A", "#4CAF50", "#43A047", "#388E3C", "#2E7D32", "#1B5E20"

        //.range(["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#006d2c","#00441b"]);


    map.selectAll(".subunit")
        .data(topojson.feature(o, o.objects.hokkaido).features)
        .enter().append("path")
        .attr('class', function (d) {
            //console.log(quantizev2(populationById.get(d.id)));
            return "subunit " + quantize(populationById.get(d.id));
        })
        .style('fill', function(d){
            return quantizev2(populationById.get(d.id))
        })
        .attr('d', path)
        .on('mouseover', onMouseOver)
        .on('mouseout', onMouseOut);

}

$(window).resize(function () {
    var w = $("#map").width();
    map.attr("width", w);
    map.attr("height", w * height / width * 0.8);
});
