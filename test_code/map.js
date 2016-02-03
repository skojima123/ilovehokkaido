/**
 * Created by kojima37 on 6/13/15.
 */

var colorMap = {
    '旭川市': '#0F6177',
    //'室蘭市':'#E6E22E',
    'えりも町': '#F3740E',
    '札幌市': 'red',
    '稚内市': 'green',
    '泊村・留夜別村': 'blue',
    '留別村・紗那村・蘂取': 'blue',
    '色丹村': 'blue',
    '根室市': '#6E89F3',
    '伊達市': 'green'
}

var populationMap = {
    '旭川市': 140000,
}

var getColorByCity = function (id) {
    //console.log(colorMap[id])
    return colorMap[id];
}

var getPopulationFromCityId = function (id){
    return populationMap[id];
}


var m_width = $('#map').width(),
    width = 1000,
    height = 500

console.log(m_width);
var map = d3.select('#map')
    .append('svg')
    .attr('preserveAspectRatio','xMidYMid')
    .attr('viewBox', '0 0 '+width+' '+height)
    .attr('width', m_width)
    .attr('height', m_width * height/width)
//.append('g');

map.append('rect')
    .attr('class','background')
    .attr('width',width)
    .attr('height',height)

map.append('g')



d3.json("./Hokkaido/hokkaido.topojson", function (error, o) {
    //console.log(o);
    var center = d3.geo.centroid(topojson.feature(o, o.objects.hokkaido))
    //console.log(center);
    var projection = d3.geo.mercator()
        .center(center)
        .scale(4500)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection)
    //.pointRadius(2);

    //console.log(o.objects.hokkaido);
    map.selectAll(".subunit")
        .data(topojson.feature(o, o.objects.hokkaido).features)
        .enter().append("path")
        .attr("class", function (d) {
            //console.log(d.id);
            return "subunit " + d.id;
        })
        .attr("cityname", function(d){
            return d.id;
        })
        .style('fill', function (d) {
            return getColorByCity(d.id);
        })
        .attr('d', path)
        .on('click', function(d){
            console.log(d.id)
            console.log(getPopulationFromCityId(d.id));
        })
        .on('mouseover', function(d){
            //when mouse is over the subunit
            var xy = d3.mouse(document.body);
            console.log('coordinate: '+ xy);
            d3.select('#tooltip')
                .style('left', (xy[0]+10)+'px')
                .style('top',  (xy[1]+10)+'px')
                .classed('hidden', false)
                //.text(d.id)
                .html("<li>"+ d.id+"</li>"+
                "<li>人口:"+getPopulationFromCityId(d.id)+"</li>")
        })
        .on('mouseout', function(){
            d3.select('#tooltip')
                .classed('hidden', true)
                .text('');
        });
});

$(window).resize(function() {
    var w = $("#map").width();
    map.attr("width", w);
    map.attr("height", w * height / width * 0.8);
});
