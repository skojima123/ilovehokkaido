/**
 * Created by kojima37 on 6/13/15.
 */





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

//map.append('rect')
//    .attr('class','background')
//    .attr('width',width)
//    .attr('height',height)

//map.append('g')

var maxPopulation = 350000;
var minPopulation = 500;

var quantize = d3.scale.quantize()
    .domain([minPopulation,maxPopulation])
    .range(d3.range(9).map(function(idx){
        return "q" + idx + "-9";
    }));


var populationById = d3.map();

queue()
    .defer(d3.json, "./Hokkaido/hokkaido.topojson")
    .defer(d3.tsv, "./Hokkaido/population.tsv", function (d) {
        populationById.set(d.city_name, d.population);
    })
    .await(ready);


function ready(error,o){
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
        .attr('class', function(d){
            return "subunit " + quantize(populationById.get(d.id));
        })
        .attr('d', path)
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
                "<li>人口:"+populationById.get(d.id)+"</li>")
        })
        .on('mouseout', function(){
            d3.select('#tooltip')
                .classed('hidden', true)
                .text('');
        });

}

$(window).resize(function() {
    var w = $("#map").width();
    map.attr("width", w);
    map.attr("height", w * height / width * 0.8);
});
