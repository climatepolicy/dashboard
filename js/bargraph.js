var spots = [0, 46.65,   136.28,  265.85,  374.385, 392, 409,  431.605];
var names = ["",  "Electric Power",  "Industrial", "Transportation","Commercial and Residential","Recycling and Waste", "High Warming Potential Gases", "Agriculture and Forestry"];

var text = ["California statewide greenhouse gas emissions from 2000 to 2011. The transportation, electric, and industrial sectors have generated the majority of emissions in California for decades. <i>Mouse over to see sector names.</i>", 
"<b>Electricity</b>", 
"<b>Industrial</b>",  
"<b>Transportation</b>",
"<b>Commercial and Residential</b>",
"<b>Recycling and Waste</b>", 
"<b>High Global Warming Potential Gases</b>", 
"<b>Agriculture</b> and <b>Forestry</b>" 
];
bargraph("csv/history_data.csv", names, text, spots, "histdiv");

var allonames = ["",  "Electric Power",  "Industrial", "Transportation","Agriculture and Forestry","Uncapped Electricity/ Industrial", "High Warming Potential Gases", "Other Uncapped"];
var allospots = [0, 56.91858325,    156.3865976, 296.5904607, 415.3103487, 440.3284842, 461.9054634, 493.0618774];

var allocation = ["Projected business-as-usual emissions through 2020 for capped and uncapped sectors. The overlaid line indicates the cap for each year. <i>Mouse over a row to see how permits are allocated to each sector.	</i>", 
"<b>Electricity</b> Sector: allowances are allocated freely to insulate electricity customers from sudden price increases.", 
"<b>Industrial</b> Sector: allowances are allocated freely until 2015 for all sectors.  After that, allocation is partially free, depending on leakage risk",  
"<b>Transportation</b> Sector: no allowances are freely allocated &#8212; the California Legislature continues to debate how to use auction revenues for the public benefit.",
"<b>Commercial and Residential</b> emissions are uncapped, but complementary policies apply (see complementary policies tab).",
"<b>Recycling and Waste</b> emissions are uncapped, but complementary policies apply (see complementary policies tab).", 
"<b>High Global Warming Potential Gas</b> emissions are uncapped, but complementary policies apply (see complementary policies tab).", 
"<b>Agriculture</b> emissions are uncapped, but complementary policies apply (see complementary policies tab). <b>Forestry</b> emissions are uncapped, but complementary policies apply (see complementary policies tab)."
];
bargraph("csv/projection_data.csv", allonames, allocation, allospots, "allodiv");

							
function bargraph(csvfile, sectornames, sectortext, vertspots, where){

var w = document.getElementById(where).offsetWidth,
    h = w*(3/4),
    p = [150, 50, 20, 20],
    right_space = 170,
    x = d3.scale.ordinal().rangeRoundBands([50, w - right_space]),
    y = d3.scale.linear().range([0, h - p[0] - p[2]]),
    capcolor = "#B53C36",
    uncapcolor = "#EAC881",
    z = d3.scale.ordinal().range(["white", capcolor, capcolor, capcolor, uncapcolor, uncapcolor, uncapcolor, uncapcolor]);

var svg1 = d3.select("#" + where).append("svg:svg")
    .attr("width", w)
    .attr("height", h)
	.attr("fill", "#666")
  .append("svg:g")
    .attr("transform", "translate(0," + (h - p[2]) + ")");
	
  d3.csv(csvfile, function(data){		
		// Transpose the data into layers by cause.
		var sectors = d3.layout.stack()(sectornames.map(function(cause){
			return data.map(function(d,i){
				return {
					x: d.date,
					y: +d[cause],
					info: d.date,
					cap: d.cap
				};
			});
		}));

		function mouseOver(){
            var thisSector = d3.select(this);
            thisSector.selectAll("rect").style("fill-opacity", "1");
            groupname.html(thisSector.attr("desc"));
        }
        
    function mouseOut(){
            var thisSector = d3.select(this);
            thisSector.selectAll("rect").style("fill-opacity", "0.8");
            groupname.html(sectortext[0]);
        }
		
		// Compute the x-domain (by date) and y-domain (by top).
		x.domain(sectors[0].map(function(d){
			return d.x;
			}));
		y.domain([0, d3.max(sectors[sectors.length - 1], function(d){
			return d.y0 + d.y;
			})]);
		
		// Add a group for each sector.
		var sector = svg1.selectAll("g.sector")
			.data(sectors)
			.enter()
			.append("svg:g")
			.attr("class", "sector")
			.attr("desc", function(d,i){return sectortext[i];})
			.style("fill", function(d, i){
				return z(i);
			})
			.on("mouseover", mouseOver).on("mouseout", mouseOut);
			
		
			
		var groupname = svg1
      .append('foreignObject')
      .attr("x", 0)
      .attr("y", 0)
      .attr("transform", "translate(0 " + (p[2]-h) + ")")
      .attr('width', w)
      .attr('height', p[0])
      .append("xhtml:div")
      .style("background-color","white")
      .html(sectortext[0]);
			
    //label sectors
    sector
      .append("svg:text")
      .attr("x", w-right_space)
      .attr("y", function(d,i){return -y(vertspots[i]);})
      .attr("dy", "3px")
      .attr("class", "subtext")
      .attr("fill", "#666")
      .text(function(d,i){return sectornames[i];});
		
		// Add a rect for each date.
		var rect = sector
    		.selectAll("rect").data(Object)
    	.enter()
    	.append("svg:rect")
    	.attr("transform", function(d){
					return "translate(" + x(d.x) + "," + (-y(d.y0) - y(d.y)) + ")";
					})
    	.attr("height", function(d){return y(d.y);})
    	.style("stroke", "white")
			.style("fill",function(d, i){ 
				if((d.info=="2013"||d.info=="2014")&&d.y>180){return uncapcolor;}})
    	.attr("width", x.rangeBand())
      .style("fill-opacity", "0.8");
		
		// Add a label per date.
		var label = svg1.selectAll("g.labels")	
    	.data(x.domain())
    	.enter()
    	.append("svg:text")
    	.attr("x", function(d){return x(d) + x.rangeBand() / 2;})
			.attr("y", 6)
			.attr("class", "subtext")
			.attr("text-anchor", "middle")
			.attr("dy", ".71em")
			.text(function(d, i){if(!isNaN(d)){return d;}
		});
		
		
		// Add y-axis rules.
		var rule = svg1.selectAll("g.rule").data(y.ticks(5)).enter().append("svg:g").attr("class", "rule").attr("transform", function(d){
			return "translate(20," + -y(d) + ")";
		});
		
		rule.attr("class", "subtext").append("svg:text").attr("text-anchor", "end").attr("x", p[1]).attr("dx", -25).attr("dy", ".35em").text(d3.format(",d"));
		
		// add y-axis label
		svg1.append("foreignObject")
      		.attr("transform", "rotate(-90)")
      		.attr("x", h-350)
			.attr("y", "0")
			.attr("width", h)
			.attr("height", h)
			.attr("class", "subtext")
			.append("xhtml")
      		.style("text-anchor", "end")
      		.html('Annual Emissions (MMTCO<sub>2</sub>e)');
			
		var keydata = [{name:'CAPPED', color: capcolor}, {name:'UNCAPPED', color: uncapcolor}];
		
		var key = svg1.append('svg:g');
		key.selectAll("keyrect")
			.data(keydata)
			.enter().append("svg:rect")
			.attr("width", 100)
			.attr("x", function(d,i){
				return (i+1)/3*(w-right_space-50);
			})
			.attr("y", 25)
			.attr("height", "1.3em")
			.style("fill", function(d){return d.color;});
		key.selectAll("text")
			.data(keydata)
			.enter().append('svg:text')
			.attr("x", function(d,i){
				return (i+1)/3*(w-right_space-50) +50;
			})
			.attr("y", 24)
			.attr("text-anchor","middle")
			.style("fill", "white")
			.attr("dy", "1em")
			.text(function (d) {return d.name;});
			
		if(where == "allodiv") //these are the differences between the cap and history graphics
		{
		//Add the cap
		svg1.append("svg:text")
			.attr("x", p[1])
			.attr("y", -y(162.8))
			.attr("dx", -30 )
			.attr("dy", 5)
			.text("CAP");
			
		var lineFunction = d3.svg.line()
			.x(function(d) { return x(d.x); })
			.y(function(d) { return -y(d.cap); })
			.interpolate("step-after");
								 
		//The line SVG Path we draw
		var lineGraph = svg1.append("path")
			.attr("d", lineFunction(sectors[7]) + "h" + x.rangeBand())
			.attr("stroke", "#666")
			.attr("stroke-width", 2)
			.attr("fill", "none");
		}
  

	});
}

