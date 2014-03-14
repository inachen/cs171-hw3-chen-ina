/**
 * Created by hen on 2/20/14.
 */
    function filter(lst1, lst2) {

        var lst = [];
        for (var i =0; i < lst1.length; i++)
        {
            if (lst2[i] != 0){
                lst.push([lst1[i], lst2[i]]);
            }
        }
        return lst;
    } 

    function findstart(lst){
        for (var i=0; i < lst.length; i++){
            if (lst[i] != 0){
                return i;
            }
        }
    }

    function interplt(year, lst){

        var start = findstart(lst);
        var output = [];

        // console.log(year);

        var pair1;
        var pair2;

        first = false;
        zeroes = [];

        for (var i=start; i < year.length; i++){
            if (lst[i] != 0 && (zeroes.length == 0)){
                pair1 = [year[i], lst[i]];
                first = true;
            }
            else if (lst[i] != 0 && first && (zeroes.length > 0)) {
                pair2 = [year[i], lst[i]];
                var s = d3.scale.linear().domain([pair1[0], pair2[0]]).range([pair1[1], pair2[1]]);
                for (var j=0; j < zeroes.length; j++){
                    index = zeroes[j]
                    output.push([year[index], s(year[index])]);
                }
                zeroes = [];
                pair1 = pair2
                first = true;

            }
            else{
                zeroes.push(i);
            }

            // console.log(i);
            // console.log(pair1);
            // console.log(pair2);
            // console.log(zeroes);
            // console.log(output);
        }

        return output;
    }

    var bbVis, brush, createVis, dataSet, handle, height, margin, svg, svg2, width;

    margin = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 150
    };

    width = 960 - margin.left - margin.right;

    height = 600 - margin.bottom - margin.top;

    bbVis = {
        x: 100,
        y: 10,
        w: width - 100,
        h: height - 100
    };

    svg = d3.select("#vis").append("svg").attr({
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom
    }).append("g").attr({
            transform: "translate(" + margin.left + "," + margin.top + ")"
        });

    dataSet = [];

    d3.csv("data.csv", function(data) {

        // convert your csv data and add it to dataSet
        var year = [];
        var est1 = [];
        var est2 = [];
        var est3 = [];
        var est4 = [];
        var est5 = [];

        year = data.map(function(d) { return +d["year"]; });
        est1 = data.map(function(d) { return +d["USCensus"]; });
        est2 = data.map(function(d) { return +d["PopulationBureau"]; });
        est3 = data.map(function(d) { return +d["UN"]; });
        est4 = data.map(function(d) { return +d["HYDE"]; });
        est5 = data.map(function(d) { return +d["Maddison"]; });

        dataSet.push(year);
        dataSet.push(est1);
        dataSet.push(est2);
        dataSet.push(est3);
        dataSet.push(est4);
        dataSet.push(est5);

        // console.log(dataSet);

        return createVis();
    });

    createVis = function() {
        var xAxis, xScale, yAxis,  yScale;

        xScale = d3.scale.linear().domain(d3.extent(dataSet[0])).range([0, width]);  // define the right domain generically
	  
        var exp = 0.01;
        var ymin = dataSet[5][0];
        var ymax = d3.max([d3.max(dataSet[1]), d3.max(dataSet[2]), d3.max(dataSet[3]), d3.max(dataSet[4]), d3.max(dataSet[5])]);

        var dmin = Math.pow(ymin, exp);
        var dmax = Math.pow(ymax, exp);
        // yScale = d3.scale.pow().exponent(exp).domain([ymin,ymax]).range([height, 0]);
        yScale = d3.scale.linear().domain([ymin,ymax]).range([height, 0]);

        xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom");

        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");

        // get dataSets for plotting
        var dataSet1 = filter(dataSet[0], dataSet[1]);
        var dataSet2 = filter(dataSet[0], dataSet[2]);
        var dataSet3 = filter(dataSet[0], dataSet[3]);
        var dataSet4 = filter(dataSet[0], dataSet[4]);
        var dataSet5 = filter(dataSet[0], dataSet[5]);

        var dataIntpl1 = interplt(dataSet[0], dataSet[1]);
        var dataIntpl2 = interplt(dataSet[0], dataSet[2]);
        var dataIntpl3 = interplt(dataSet[0], dataSet[3]);
        var dataIntpl4 = interplt(dataSet[0], dataSet[4]);
        var dataIntpl5 = interplt(dataSet[0], dataSet[5]);
        // console.log(dataIntpl2);

        var line = d3.svg.line()
            .x(function(d) { return xScale(d[0]); })
            .y(function(d) { return yScale(d[1]); });

        svg.append("g")
          .attr("class", "axis")
          .call(xAxis)
          .attr("transform", "translate( 0," + height + ")")
        
        svg.append("text")
            .attr("class", "label")
            .attr("text-anchor", "end")
            .attr("x", width/(2.0))
            .attr("y", height + margin.bottom)
            .text("Year");


        svg.append("g")
          .attr("class", "axis")
          .call(yAxis)

        svg.append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("x", 0 - (height / 2.0))
          .attr("y", 0 - margin.left)
          .attr("dy", "1em")
          .style("text-anchor", "end")
          .text("Population");

        svg.append("path")
          .datum(dataSet1)
          .attr("class", "line1")
          .attr("d", line);

        svg.append("path")
          .datum(dataSet2)
          .attr("class", "line2")
          .attr("d", line);

        svg.append("path")
          .datum(dataSet3)
          .attr("class", "line3")
          .attr("d", line);

        svg.append("path")
          .datum(dataSet4)
          .attr("class", "line4")
          .attr("d", line);

        svg.append("path")
          .datum(dataSet5)
          .attr("class", "line5")
          .attr("d", line);

        // size of dots
        var csize = 3

        svg.selectAll(".dot1")
          .data(dataSet1)
        .enter().append("circle")
          .attr("class", "dot1")
          .attr("r", csize)
          .attr("cx", function(d) {return xScale(d[0]);})
          .attr("cy", function(d) {return yScale(d[1]);});

        svg.selectAll(".dot2")
          .data(dataSet2)
        .enter().append("circle")
          .attr("class", "dot2")
          .attr("r", csize)
          .attr("cx", function(d) {return xScale(d[0]);})
          .attr("cy", function(d) {return yScale(d[1]);});

        svg.selectAll(".dot3")
          .data(dataSet3)
        .enter().append("circle")
          .attr("class", "dot3")
          .attr("r", csize)
          .attr("cx", function(d) {return xScale(d[0]);})
          .attr("cy", function(d) {return yScale(d[1]);});

        svg.selectAll(".dot4")
          .data(dataSet4)
        .enter().append("circle")
          .attr("class", "dot4")
          .attr("r", csize)
          .attr("cx", function(d) {return xScale(d[0]);})
          .attr("cy", function(d) {return yScale(d[1]);});

        svg.selectAll(".dot5")
          .data(dataSet5)
        .enter().append("circle")
          .attr("class", "dot5")
          .attr("r", csize)
          .attr("cx", function(d) {return xScale(d[0]);})
          .attr("cy", function(d) {return yScale(d[1]);});

        svg.selectAll(".dot1i")
          .data(dataIntpl1)
        .enter().append("circle")
          .attr("class", "dot1 inplt")
          .attr("r", csize)
          .attr("cx", function(d) {return xScale(d[0]);})
          .attr("cy", function(d) {return yScale(d[1]);});

        svg.selectAll(".dot2i")
          .data(dataIntpl2)
        .enter().append("circle")
          .attr("class", "dot2 inplt")
          .attr("r", csize)
          .attr("cx", function(d) {return xScale(d[0]);})
          .attr("cy", function(d) {return yScale(d[1]);});

        svg.selectAll(".dot3i")
          .data(dataIntpl3)
        .enter().append("circle")
          .attr("class", "dot3 inplt")
          .attr("r", csize)
          .attr("cx", function(d) {return xScale(d[0]);})
          .attr("cy", function(d) {return yScale(d[1]);});

        svg.selectAll(".dot4i")
          .data(dataIntpl4)
        .enter().append("circle")
          .attr("class", "dot4 inplt")
          .attr("r", csize)
          .attr("cx", function(d) {return xScale(d[0]);})
          .attr("cy", function(d) {return yScale(d[1]);});

        svg.selectAll(".dot5i")
          .data(dataIntpl5)
        .enter().append("circle")
          .attr("class", "dot5 inplt")
          .attr("r", csize)
          .attr("cx", function(d) {return xScale(d[0]);})
          .attr("cy", function(d) {return yScale(d[1]);});

        svg.append("g")
        .attr("transform", "translate (-100, 540)")
        .append("text")
        .text("[Solid dots are table values whereas faded dots are interpolated values]");

    };
