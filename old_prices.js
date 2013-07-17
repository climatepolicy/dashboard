var margin = {top: 10, right: 40, bottom: 35, left: 35},
   	width = document.getElementById("pricediv").offsetWidth-80, //need to fix this - label is outside the official width, so this is a quick fix hack barf house supreme
    height = width*(4/5);  //make it square-ish for now

var parseDate = d3.time.format("%m/%d/%Y").parse;

var price_x = d3.time.scale()
    .range([0, width]);

var price_y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var fontfam = 'CronosProLight';

var xAxis = d3.svg.axis()
    .scale(price_x)
	.ticks(4)
	.tickFormat(d3.time.format("%m/%y"))
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(price_y)
    .orient("left")
	.ticks(5)
	.tickFormat(function(d) {return "$" + d;});

var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return price_x(d.date); })
    .y(function(d) { return price_y(d.price); });

var svg = d3.select("#pricediv").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("carbon_prices.csv", function(error, data) {
  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

  data.forEach(function(d) {
    d.date = parseDate(d.date);
  });

  var symbols = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {date: d.date, price: +d[name]};
      })
    };
  });

  price_x.domain(d3.extent(data, function(d) { return d.date; }));

  price_y.domain([
    d3.min(symbols, function(c) { return d3.min(c.values, function(v) { return v.price; }); }),
    d3.max(symbols, function(c) { return d3.max(c.values, function(v) { return v.price; }); })
  ]);

  svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
	  	   .selectAll("text")
		   .attr("font-size", "0.9em")
		   .attr("transform", "translate(0,10) rotate(45)" );

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
	  .attr("font-family", fontfam)
      .text("$/Ton");

  var symbol = svg.selectAll(".symbol")
      .data(symbols)
    .enter().append("g")
      .attr("class", "symbol");

  symbol.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
	  .attr("fill", "white")
      .style("stroke", "#F96302" );

  symbol.append("text")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + price_x(d.value.date) + "," + price_y(d.value.price) + ")"; })
      .attr("x", 3)
      .attr("dy", ".35em")
	  .attr("font-family", fontfam)
      .text(function(d) { return "$" + d.value.price; });
	  
  var focus = svg.append("g")
      .attr("class", "focus")
      .style("display", "none");

  focus.append("circle")
      .attr("r", 4.5);

  focus.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");

  svg.append("rect")
      .attr("class", "overlay")
	  .style("fill","white")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", function() { focus.style("display", null); })
      .on("mouseout", function() { focus.style("display", "none"); })
      .on("mousemove", mousemove);

  function mousemove(){
  	var x0 = x.invert(d3.mouse(this)[0]), i = bisectDate(data, x0, 1), d0 = data[i - 1], d1 = data[i], d = x0 - d0.date > d1.date - x0 ? d1 : d0;
  	focus.attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")");
  	focus.select("text").text(formatCurrency(d.close));
  }
});
