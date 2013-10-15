var margin = {top: 10, right: 30, bottom: 30, left: 25},
    width = document.getElementById("pricediv").offsetWidth-60,
    height = 219;

var parseDate = d3.time.format("%m/%d/%Y").parse,
    bisectDate = d3.bisector(function(d) { return d.date; }).left,
    formatValue = d3.format(",.2f"),
    formatDate = d3.time.format("%B %e"),
    formatCurrency = function(d) { return "$" + formatValue(d); };

var x = d3.time.scale()
    .range([0, width-30]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .tickFormat(d3.time.format("20%y"))
    .ticks(d3.time.years, 1)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(5)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.close); });

var svg = d3.select("#pricediv").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    //.style("font-size", "11px")
    .style("font-family", 'CronosProLight')
    .style("fill","#666")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("csv/carbon_prices.csv", function(error, data) {
  data.forEach(function(d) {
    d.date = parseDate(d.date);
    d.close = +d.close;
  });

  data.sort(function(a, b) {
    return a.date - b.date;
  });

  x.domain([data[0].date, data[data.length - 1].date]);
  y.domain(d3.extent(data, function(d) { return d.close; }));

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  path = svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);
      
   var totalLength = path.node().getTotalLength();

    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
        .duration(2000)
        .ease("linear")
        .attr("stroke-dashoffset", 0);
      
   svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("y", 5)
      .attr("x", -25)
      .style("text-anchor", "left")
      .text("$/Tonne Carbon Dioxide Equivalent");
  
  var focus = svg.append("g")
      .attr("class", "focus");

  focus.append("circle")
      .attr("r", 4.5);

  focus.append("text")
      .attr("x", 9)
      .style("background-color",'white')
      .attr("dy", "0em");
      
  var currentDate = svg.append("g")
      .attr("class", "focus");

  currentDate.append("line")
      .attr("x0", 0)
      .attr("y0", 0)
      .attr("x1", 0)
      .attr("y1", -height+10)
      .style("stroke", "gray");
      
  currentDate.append("text")
      .style("text-anchor", "middle")
      .attr("x", 9)
      .attr("dy", ".35em");
	
  focusIt();

  svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", function() { focus.style("display", null); })
      .on("mouseout", function() { focusIt(); })
      .on("mousemove", mousemove);
      
  function focusIt(){
  	focus.attr("transform", "translate(" + (width-30) + "," + y(data[data.length-1].close) + ")");
  	focus.select("text").text(formatCurrency(data[data.length-1].close));
  	
  	currentDate.attr("transform", "translate(" + (width-30) + "," + height + ")");
    currentDate.select("text").text(formatDate(data[data.length-1].date));
  }

  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    focus.attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")");
    focus.select("text").text(formatCurrency(d.close));
    
    currentDate.attr("transform", "translate(" + x(d.date) + "," + height + ")");
    currentDate.select("text").text(formatDate(d.date));
  }
});