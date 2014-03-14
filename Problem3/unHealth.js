var bbDetail, bbOverview, dataSet, svg, dotsgroup;

// graph dimensions
var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var width = 960 - margin.left - margin.right;

var height = 800 - margin.bottom - margin.top;

bbOverview = {
    x: 100,
    y: 30,
    w: width,
    h: 100
};

bbDetail = {
    x: 100,
    y: 230,
    w: width,
    h: 500
};

// dataSet = [];

// d3.csv("undata.csv", function(data) {
//     // console.log(data[0]);
//     var format = d3.time.format("%B %Y");
//     for (var i = 0; i < data.length; i++)
//     {
//         var d = format.parse(data[i].date);
//         var next = {};
//         next["date"] = d;
//         next["womens"] = data[i].womens;
//         dataSet.push(next);

//     }

//     // console.log(dataSet)
// });

// var convertToInt = function(s) {
//     return parseInt(s.replace(/,/g, ""), 10);
// };

// set up scales
var xScale = d3.time.scale()
    .range([0, width]);
var xScale2 = d3.time.scale()
    .range([0, width]);
var yScale = d3.scale.linear()
    .range([bbDetail.h, 0]);
var yScale2 = d3.scale.linear()
    .range([bbOverview.h, 0]);

// set up axis
var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
var xAxis2 = d3.svg.axis().scale(xScale2).orient("bottom");
var yAxis = d3.svg.axis().scale(yScale).orient("left");
var yAxis2 = d3.svg.axis().scale(yScale2).orient("left");

// brush
var brush = d3.svg.brush()
    .x(xScale2)
    .on("brush", brushed);

// plotting functions
var area_detail = d3.svg.area()
    .x(function(d) { return xScale(d.date); })
    .y0(bbDetail.h)
    .y1(function(d) { return yScale(d.womens); });

// var area_overview = d3.svg.area()
//     .x(function(d) { return xScale2(d.date); })
//     .y0(bbOverview.h)
//     .y1(function(d) { return yScale2(d.womens); });

var path_detail = d3.svg.line()
    .x(function(d) { return xScale(d.date); })
    .y(function(d) { return yScale(d.womens); });

var path_overview = d3.svg.line()
    .x(function(d) { return xScale2(d.date); })
    .y(function(d) { return yScale2(d.womens); });

// var dot_detail = d3.svg.circle().
//     .attr("r", 2.5)
//       .attr("cx", function(d) {return xScale(d.date);})
//       .attr("cy", function(d) {return yScale(d.womens);});

svg = d3.select("#visUN").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
});

// for parsing x axis data
var parseDate = d3.time.format("%B %Y").parse;

svg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", bbDetail.w)
    .attr("height", bbDetail.h);

//add overview and detail panels
var overview = svg.append("g")
    .attr("class", "overview")
    .attr("transform", "translate(" + bbOverview.x + "," + bbOverview.y + ")");

var detail = svg.append("g")
    .attr("class", "detail")
    .attr("transform", "translate(" + bbDetail.x + "," + bbDetail.y + ")");

// event tooltips
var tip1 = d3.tip()
  .attr('class', 'd3-tip')
  .offset([0, 10])
  .direction('e')
  .html("Controversy over the contraception mandate for women's preventive health services in the Affordable Care Act");

var tip2 = d3.tip()
  .attr('class', 'd3-tip')
  .offset([0, 10])
  .direction('e')
  .html("Supreme Court upholds birth control mandate in Affordable Care Act");

svg.call(tip1);
svg.call(tip2);

// event brushes
// var brush_event1 = d3.svg.brush()
//     .x(xScale2)
//     .extent([.3, .5])
//     .on("brush", brushed);


// brushing and linking adapted from http://bl.ocks.org/mbostock/1667367
d3.csv("undata.csv", type, function(data) {

    // scale domains
    xScale.domain(d3.extent(data.map(function(d) { return d.date; })));
    yScale.domain([0, d3.max(data.map(function(d) { return d.womens; }))]);
    xScale2.domain(xScale.domain());
    yScale2.domain(yScale.domain());

    // detail plotting
    detail.append("path")
        .datum(data)
        .attr("class", "detailArea")
        .attr("d", area_detail);

    detail.append("path")
        .datum(data)
        .attr("class", "detailPath")
        .attr("d", path_detail);

    detail.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + bbDetail.h + ")")
        .call(xAxis);

    detail.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    dotsgroup = detail.append("g")
        .selectAll('.detailDot')
            .data(data)
            .enter().append("circle")
            .attr('class', 'detailDot')
            .attr("cx",function(d){ return xScale(d.date);})
            .attr("cy", function(d){ return yScale(d.womens);})
            .attr("r", function(d){ return 2.5;});   

    // detail.selectAll(".detailDot")
    //   .data(data)
    // .enter().append("circle")
    //   .attr("class", "detailDot")
    //   .attr("d", dot_detail);

    // overview plotting
    overview.append("path")
        .datum(data)
        .attr("class", "overviewPath")
        .attr("d", path_overview);

    overview.append("g")
        .attr("class", "y axis")
        .call(yAxis2);

    overview.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + bbOverview.h + ")")
      .call(xAxis2);

    var thisBrush = overview.append("g")
      .attr("class", "x brush")
      .call(brush);

    thisBrush.selectAll("rect")
      .attr("y", -6)
      .attr("height", bbOverview.h + 7);

    overview.selectAll(".overviewDot")
      .data(data)
    .enter().append("circle")
      .attr("class", "overviewDot")
      .attr("r", 2.5)
      .attr("cx", function(d) {return xScale2(d.date);})
      .attr("cy", function(d) {return yScale2(d.womens);})

    // special events
    var event1 = overview.append("g")
        .attr("transform", "translate(510, 20)")
        .on('mouseover', tip1.show)
        .on('mouseout', tip1.hide)
        .on('click', function (){
            thisBrush.call(brush.extent([new Date(2011, 10, 1), new Date(2012, 4, 1)]))
            .call(brush.event);

        });

    event1.append("rect")
        .attr("class", "eventRect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("rx", 5)
        .attr("ry", 5);

    event1.append("text")
        .attr("class", "eventText")
        .attr("dy", "1.25em")
        .attr("dx", "0.25em")
        .text("#1");

    var event2 = overview.append("g")
        .attr("transform", "translate(590, -20)")
        .on('mouseover', tip2.show)
        .on('mouseout', tip2.hide)
        .on('click', function (){
            thisBrush.call(brush.extent([new Date(2012, 5, 1), new Date(2012, 11, 1)]))
            .call(brush.event);

        });

    event2.append("rect")
        .attr("class", "eventRect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("rx", 5)
        .attr("ry", 5);

    event2.append("text")
        .attr("class", "eventText")
        .attr("dy", "1.25em")
        .attr("dx", "0.25em")
        .text("#2");
    


    //brush.extent([[xInv, yInv], [xInv, yInv]]);
});

// brush function for mouse
function brushed() {
  // d3.event.stopPropagation();
  xScale.domain(brush.empty() ? xScale2.domain() : brush.extent());
  detail.select(".detailArea").attr("d", area_detail);
  detail.select(".detailPath").attr("d", path_detail);
  detail.selectAll(".detailDot").attr("cx",function(d){ return xScale(d.date);}).attr("cy", function(d){ return yScale(d.womens);});
  detail.select(".x.axis").call(xAxis);
}

// data parsing
function type(d) {
  d.date = parseDate(d.date);
  d.womens = +d.womens;
  return d;
}


