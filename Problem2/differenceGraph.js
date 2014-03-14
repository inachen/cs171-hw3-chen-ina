/**
 * differenceGraph.js
 */
    // filters out zeroes
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

    // finds first non-zero index
    function findstart(lst){
        for (var i=0; i < lst.length; i++){
            if (lst[i] != 0){
                return i;
            }
        }
    }

    // interpolate data
    function interplt(year, lst){

        var start = findstart(lst);
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
                    index = zeroes[j];
                    lst[index] = s(year[index]);
                }
                zeroes = [];
                pair1 = pair2
                first = true;

            }
            else{
                zeroes.push(i);
            }
        }

        return lst;
    }

    // http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
    function add_commas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // calculate consensus and standard deviation, output plotting data
    function calc_consensus(year, lst1, lst2, lst3, lst4, lst5){

      var output = [];

      for (var i = 0; i < year.length; i++){
        var nums = [];

        if (lst1[i] != 0){nums.push(lst1[i]);}
        if (lst2[i] != 0){nums.push(lst2[i]);}
        if (lst3[i] != 0){nums.push(lst3[i]);}
        if (lst4[i] != 0){nums.push(lst4[i]);}
        if (lst5[i] != 0){nums.push(lst5[i]);}

        console.log(nums);

        if (nums.length != 0){
            var sum = 0
            for (var j = 0; j < nums.length; j++){
                sum = sum + nums[j];
            }

            var avg = sum / (nums.length * 1.0);

            var variance = 0;
            for (var j = 0; j < nums.length; j++){
                variance = variance + Math.pow( (nums[j] - avg), 2 );
            }

            var sd = Math.sqrt(variance);

            output.push([year[i], avg, sd]);
        }
      }

      return output;

    }
    // setting up graph
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

    // obtaining data
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
      
        var exp = 1/3000000;
        var ymin = dataSet[5][0];
        var ymax = d3.max([d3.max(dataSet[1]), d3.max(dataSet[2]), d3.max(dataSet[3]), d3.max(dataSet[4]), d3.max(dataSet[5])]);

        var dmin = Math.pow(ymin, exp);
        var dmax = Math.pow(ymax, exp);
        // yScale = d3.scale.log().domain([20000000,ymax]).range([height, 0]);
        // yScale = d3.scale.pow().exponent(exp).domain([ymin,ymax]).range([height, 0]);
        yScale = d3.scale.linear().domain([ymin,ymax]).range([height, 0]);

        xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom");

        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");

        // clean dataSets
        var dataIntpl1 = interplt(dataSet[0], dataSet[1]);
        var dataIntpl2 = interplt(dataSet[0], dataSet[2]);
        var dataIntpl3 = interplt(dataSet[0], dataSet[3]);
        var dataIntpl4 = interplt(dataSet[0], dataSet[4]);
        var dataIntpl5 = interplt(dataSet[0], dataSet[5]);
        // console.log(dataIntpl5);

        var consensus = calc_consensus(dataSet[0], dataIntpl1, dataIntpl2, dataIntpl3, dataIntpl4, dataIntpl5);

        var line_avg = d3.svg.line()
            .x(function(d) { return xScale(d[0]); })
            .y(function(d) { return yScale(d[1]); });

        var line_sd1 = d3.svg.line()
            .x(function(d) { return xScale(d[0]); })
            .y(function(d) { return yScale(d[1] + d[2]); });

        var line_sd2 = d3.svg.line()
            .x(function(d) { return xScale(d[0]); })
            .y(function(d) { return yScale(d[1] - d[2]); });

        var area = d3.svg.area()
            .x(function(d) { return xScale(d[0]); })
            .y0(function(d){ return yScale(d[1] - d[2]);})
            .y1(function(d){ return yScale(d[1] + d[2]);});

        // mouseover tooltip adapted from http://bl.ocks.org/Caged/6476579
        var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, -10])
          .direction('nw')
          .html(function(d) {
            return ("Year: " + d[0] + "<br> Consensus: " + add_commas(d[1].toFixed(0)) 
                + " <br> Divergence: " + add_commas(d[2].toFixed(0)) 
                + " (" + add_commas((d[2] / (d[1] * 1.0) * 100).toFixed(2)) + "%)");
        });

        svg.call(tip);

        svg.append("g")
          .attr("class", "axis")
          .call(xAxis)
          .attr("transform", "translate( 0," + height + ")")
          .append("text")
            .text("Year");

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
            .datum(consensus)
            .attr("class", "errorarea")
            .attr("d", area);

        svg.append("path")
          .datum(consensus)
          .attr("class", "lineavg")
          .attr("d", line_avg);

        svg.append("path")
          .datum(consensus)
          .attr("class", "linesd")
          .attr("d", line_sd1);

        svg.append("path")
          .datum(consensus)
          .attr("class", "linesd")
          .attr("d", line_sd2);

        svg.append("g")
        .attr("transform", "translate (-100, 540)")
        .append("text")
        .text("[Hover over points to see divergence and % divergence]");

        // size of dots
        var csize = 2.5;

        svg.selectAll(".dot")
          .data(consensus)
        .enter().append("circle")
          .attr("class", "dot")
          .attr("r", csize)
          .attr("cx", function(d) {return xScale(d[0]);})
          .attr("cy", function(d) {return yScale(d[1]);})
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide);

    };
