var margin = {top: 10, right: 40, bottom: 30, left: 42},
    width = document.getElementById("pricediv").offsetWidth-60,
    height = 278;

var parseDate = d3.time.format("%m/%d/%Y").parse,
    bisectDate = d3.bisector(function(d) { return d.date; }).left,
    formatValue = d3.format(",.2f"),
    formatDate = d3.time.format("%B %e"),
    formatCurrency = function(d) { return "$" + formatValue(d); };
    formatVolume = function(d) {return "Trading Volume: "+ d;}

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10()
    .range(["#B53C36"]);//,"#EAC881"]);

var xAxis = d3.svg.axis()
     .scale(x)
    .tickFormat(d3.time.format("20%y"))
    .ticks(d3.time.years, 1)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .defined(function(d) { return d.close != 0; }) // this would change
    .interpolate("basis")
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.close); });

var svg = d3.select("#pricediv").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("fill","#666")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("csv/live graphing prices and volumes.csv", function(error, data) {
  var headers = d3.keys(data[0]).filter(function(key) { return key !== "date"; });
  // create an index into headers for the ones that are settle prices. pass that into color.domain
  /*var volumes = [];
  for(index = 0; index < headers.length; index++) {
      // creates an array with the indices of the volume columns
      var end = headers[index].substring(12, headers[index].length);
      if(end == "volume") {
        volumes.push(index);
      } 
  };*/
  // volumes now containes the indices of the volume columns

  var prices = [];
  for(index = 0; index < headers.length; index++) {
      // creates an array with the indices of the price columns
      var end = headers[index].substring(12, headers[index].length);
      if(end == "price") {
        prices.push(headers[index]);
      } /*else {
        console.log(end)
      }*/
  };
  
  color.domain(prices);
  //d3.keys(data[0]) returns column headers. .filter returns those that arent 'date', 
  // finally, color is a scale (i think) that maps the domain (a set of names) to a range (the colors)
  // if volumes are column headers, the definition of this domain will need to be changed
  // which means a substantial amount of the rest of this code will probably need to change too

  //Changing the color.domain definition will be key //

  data.forEach(function(d) { // redefines the structure of data for us. this needs to change prolly,
    d.date = parseDate(d.date); // but maybe not since its not much used in current setup
    d.close = d;
  });

  var vintages = color.domain().map(function(name) {
    // to create this object properly we need to pair the correct price w the correct volume - by year & month
    var year = name.substring(1,3);
    var month = name.substring(3,7)
    var volName = "V" + year + month + year + " - volume"; 

    console.log(name);
    console.log(volName);
    return {
      name: name, 
      // the name of the wrapper object is the column header (one of the values of the color domain)
      // the wrapper object contains an object for every date entry (every row)
      // these objects contain the date and the value for that column header.

            values: data.map(function(d) { 
        return {date: d.date, close: d[name], vol: d[volName]}; 
      })
    };
  });

  x.domain(d3.extent(data, function(d) { return d.date; }));

  y.domain([
    d3.min(vintages, function(c) { return d3.min(c.values, function(v) { if (v.close>0){return v.close;} }); }),
    d3.max(vintages, function(c) { return d3.max(c.values, function(v) { return v.close; }); })
  ]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("foreignObject")
      .attr("width", width)
      .attr("height", 100)
      .attr("transform", "rotate(270) translate(-80 -45)")
      .attr("class", "subtext")
    .append("xhtml:div")
      .html("$/Tonne CO<sub>2</sub>e");

  var vintage = svg.selectAll(".vintage")
      .data(vintages)
    .enter().append("g")
      .attr("class", "vintage");

  vintage.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.name); }); 
      
  var focus = vintage.append("g")
      .attr("class", "focus");

  focus.append("line")
      .attr("x1", 0)
      .attr("y1", 30)
      .attr("x2", 0)
      .attr("y2", height)
      .style("stroke", "#666");
      
  focus.append("text")
      .style("text-anchor", "middle")
      .style("background-color",'white')
      .attr("x", 9)
      .attr("dx", -10)
      .attr("dy", 15);
      //.attr("dy", function(d,i){ return 5+i*15;}); use this if we ever have multiple lines on top of each
      
  focus.append("svg:rect")
      .attr("width",100)
      .attr("height",40)
      .style("fill","#F5FAF9")
      .style("stroke","#666")
      .style("stroke-width",2)
      .style("opacity",0.3)
      .attr("x", -50)
      .attr("y", -10)
      .attr("rx",5)
      .attr("ry",5); 
      
  datetext = focus.append("svg:text")
      .style("text-anchor", "middle")
      .style("background-color",'white')
      .attr("x", 9)
      .attr("dx", -10)
      .attr("dy", 0)
      .attr("font-size", 12);

   voltext = focus.append("svg:text")
      .style("text-anchor", "middle")
      .style("background-color",'white')
      .attr("x", 9)
      .attr("dx", -10)
      .attr("dy", 25)
      .attr("font-size", 12);

  focusIt();

   svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", function() {focus.style("display", null); })
      .on("mouseout", function() { focusIt(); })
      .on("mousemove", mousemove);
      
  function focusIt(){
    focus.attr("transform", "translate(" + width + ",0)");  
    datetext.text(function(d){ 
      if( d.values[d.values.length-1].close > 0)
      {
        return formatDate(d.values[d.values.length-1].date);
      } 
    });
    voltext.text(function(d){ 
      if( d.values[d.values.length-1].vol > -1 & d.values[d.values.length-1].vol !== "")
      {
        return formatVolume(d.values[d.values.length-1].vol);
      } 
    });
    focus.select("text").text(function(d){ 
      if( d.values[d.values.length-1].close > 0)
      {
        return formatCurrency(d.values[d.values.length-1].close);
      } 
    });

  }

  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;

    focus.attr("transform", "translate(" + x(d.date) + ",0)");
    datetext.text(function(d){ 
      if( d.values[d.values.length-1].close > 0)
      {
        return formatDate(d.values[i].date);
      } 
    });
    
    voltext.text(function(d){ 
      if( d.values[i].vol > -1 & d.values[i].vol !== "")
      {
        return formatVolume(d.values[i].vol);
      } 
    });

    focus.select("text").text(function(d){ 
      if( d.values[i].close > 0)
      {
        return formatCurrency(d.values[i].close);
      } 
    });
  }

});