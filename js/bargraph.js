function bargraph(csvfile, sectornames, where){

var w = document.getElementById(where).offsetWidth,
    h = w*(3/4),
	des_space = 100,
    p = [20, 50, 100, 20],
    x = d3.scale.ordinal().rangeRoundBands([50, w]),
    y = d3.scale.linear().range([0, h - p[0] - p[2]]),
    capcolor = "#B53C36",
    uncapcolor = "#EAC881",
    z = d3.scale.ordinal().range(["white", capcolor, capcolor, capcolor, uncapcolor, uncapcolor, uncapcolor, uncapcolor, uncapcolor]);

var svg1 = d3.select("#" + where).append("svg:svg")
    .attr("width", w)
    .attr("height", h)
	.attr("font-family", 'CronosProLight')
	.attr("fill", "#666")
	.attr("font-size", "16px")
  .append("svg:g")
    .attr("transform", "translate(0," + (h - p[2]) + ")");
	
	d3.csv(csvfile, function(data){
			
		// Transpose the data into layers by cause.
		var sectors = d3.layout.stack()(["Blank",  "Electric Power",  "Industrial", "Transportation","Commercial and Residential","Recycling and Waste", "High GWP", "Agriculture", "Forestry"].map(function(cause){
			return data.map(function(d){
				return {
					x: d.date,
					y: +d[cause],
					info: d.date,
					policy: d.policy,
					cap: d.cap
				};
			});
		}));
		

		function mouseOver(){
			var thisSector = d3.select(this);
			thisSector.selectAll("rect").style("fill-opacity", "1");
			thisSector.selectAll(".group-label").attr("visibility", "visible");
			groupname.html(function(d, i){
					return thisSector.attr("desc");
				});
		}
		
		function mouseOut(){
			var thisSector = d3.select(this);
			thisSector.selectAll("rect").style("fill-opacity", "0.8");
			thisSector.selectAll(".group-label").attr("visibility", "hidden");
			groupname.html(sectornames[0]);
		}
		
		/*function click(){
			rect.attr("transform", function(d){
				return "translate(" + x(d.x1) + "," + (-y(d.y0) - y(d.y)) + ")";
			});
			policytext.attr("visibility", "hidden");
			var newlabel = svg.selectAll("horses").data(x.domain()).enter().append("svg:text").attr("x", function(d){
				return x(d) + x.rangeBand() / 2;
			}).attr("y", 6).attr("text-anchor", "middle").attr("dy", ".71em").text(function(d, i){
				return d;
			})
		}*/
		
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
			.attr("desc", function(d,i){return sectornames[i];})
			.style("fill", function(d, i){
				return z(i);
			})
			.on("mouseover", mouseOver).on("mouseout", mouseOut);//.on("click", click);
			
		 var lineFunction = d3.svg.line()
			.x(function(d) { return x(d.x); })
			.y(function(d) { return -y(d.cap); })
			.interpolate("step-after");
								 
		//The line SVG Path we draw
		var lineGraph = svg1.append("path")
			.attr("d", lineFunction(sectors[8]) + "h" + x.rangeBand())
			.attr("stroke", "#666")
			.attr("stroke-width", 2)
			.attr("fill", "none");
	
		
		// Add a rect for each date.
		var rect = sector.selectAll("rect").data(Object).enter().append("svg:rect").attr("transform", function(d){
			return "translate(" + x(d.x) + "," + (-y(d.y0) - y(d.y)) + ")";
		}).attr("height", function(d){
			return y(d.y);
		}).style("stroke", "white")
			.style("fill",function(d, i){ 
				if((d.info=="2013"||d.info=="2014")&&d.y>180){return uncapcolor;} // THIS IS NOT ELEGANT
				
			}).attr("width", x.rangeBand())
           .style("fill-opacity", "0.8");
		
		var dots = sector.selectAll("circle")
		 .data(Object)
		 .enter().append("svg:circle")
		 .attr("class", "group-label")
		 .attr("visibility", "hidden")
		 .attr("fill", "black")
		 .attr("cx", function(d) { return x(d.x) + x.rangeBand()/2; })
		 .attr("cy", function(d) { return -y(d.y0) - y(d.y) -10; })
		 .attr("r", function(d,i){if(d.policy==='1' && d.y>0 && d.y<300){return 5;} else{return 0;}});
		
		
		// Add a label per date.
		var label = svg1.selectAll("g.labels").data(x.domain()).enter().append("svg:text").attr("x", function(d){
			return x(d) + x.rangeBand() / 2;
		})
		
		.attr("y", 6)
		.attr("text-anchor", "middle")
		.attr("dy", ".71em")
		.text(function(d, i){if(!isNaN(d))
			{
				return d;
			}
		});
		
		//add group info	  
		
			/*d3.select('#describe').append("svg:svg")
    			.attr("width", w)
    			.attr("height", h)
  				.append("svg:g")
    			.attr("transform", "translate(" + p[3] + "," + (h - p[2]) + ")")
				.select('#describe')
				.append("svg:svg")
    			.attr("width", 50)
    			.attr("height", 50)*/
		
		var groupname = sector
				.append('foreignObject')
				.attr("class", "group-label")
				.attr("x", 0)
				.attr("y", 50)
				//.attr("dy", ".35em")
				//.attr("fill", "black")
				//.attr("visibility", "hidden")
				//.attr("font-size", "12")
				.attr('width', w - p[1] - p[3])
                .attr('height', 100)
				
				.append("xhtml:p")
				.style("background-color","white")
				.html(sectornames[0]);
				//.html('This is some information about whatever');
				//.html(function(d, i){
				//	return sectornames[1];
				//});
		
		d3.selectAll("p").style("stroke","red");
		
		// Add y-axis rules.
		var rule = svg1.selectAll("g.rule").data(y.ticks(5)).enter().append("svg:g").attr("class", "rule").attr("transform", function(d){
			return "translate(20," + -y(d) + ")";
		});
		
		rule.append("svg:text").attr("x", 0).attr("dy", ".35em").text(d3.format(",d"));
		
		// add y-axis label
		svg1.append("text")
      		.attr("transform", "rotate(-90)")
      		.attr("x", h-150)
			.attr("y", "1em")
      		.style("text-anchor", "end")
      		.text('Annual Emissions (MMTCO2e)');
			
				keydata = [{name:'CAPPED', color: capcolor}, {name:'UNCAPPED', color: uncapcolor}];
		
		key = svg1.append('svg:g');
		key.selectAll("keyrect")
			.data(keydata)
			.enter().append("svg:rect")
			.attr("width", 100)
			.attr("x", function(d,i){
				return (i+1)/3*w;
			})
			.attr("y", 25)
			.attr("height", "1.3em")
			.style("fill", function(d){return d.color});
		key.selectAll("text")
			.data(keydata)
			.enter().append('svg:text')
			.attr("x", function(d,i){
				return (i+1)/3*w + 50;
			})
			.attr("y", 24)
			.attr("text-anchor","middle")
			.style("fill", "white")
			.attr("dy", "1em")
			.text(function (d) {return d.name});

	});
}

