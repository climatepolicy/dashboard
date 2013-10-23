var othernames = ["AB32 establishes a number of important Complementary Policies to achieve the bulk of reductions to meet California's statewide 427 MMTCO2e emissions goal for 2020. The Cap and Trade Program acts as a backstop to these Complementary Policies. This graphic shows greenhouse gas emissions in 2020 under business-as-usual conditions and under AB32 implementation, and the expected contributions of each Complementary Policy to AB32 reductions. <i>Mouse over to see which policies apply to a given sector.  Click on any policy for more details.</i>", 
                "The <b>Electricity</b> sector is subject to a renewable portfolio standard and renewable energy standard, which together require 33% of electricity come from renewable sources by 2020.  Under the current policies, small scale distributed generation cannot be used toward meeting this goal, but the Governor's Million Solar Roofs program promotes progress in distributed generation as well.", 
                "The <b>Industrial</b> sector is required to conduct energy efficiency audits and report the results to the Air Resources Board.",  
                "The <b>Transportation</b> sector is addressed by a number of California policies, including the Pavley Standards, which require significant increases in vehicle fuel efficiency.  Further, the Low Carbon Fuel Standard requires refiners and blenders to source a significant portion of their fuel from renewable sources.",
                "<b>Commercial and Residential</b> energy efficiency programs are expected to yield nearly 12 MMTCO<sub>2</sub>e in carbon emissions reductions.",
                "<b>Recycling and Waste</b> is a low-emitting sector, but reduction programs are in place.", 
                "<b>High Global Warming Potential Gases</b> are a significant source of emissions today, but policies are designed to nearly eliminate those emissions by 2020.", 
                "<b>Agriculture</b> emissions are not addressed by the cap and trade program or complementary policies, but offset protocols may be developed to meeting the cap. Current <b>Forestry</b> sector emissions are minimal, but new programs are designed to make them a significant net carbon sink by 2020."
                ];
compgraph("csv/inventory_data.csv", othernames, "compdiv");					

function compgraph(csvfile, sectornames, where){

var w = document.getElementById(where).offsetWidth,
    h = 0.9*w,
    p = [140, 50, 55, 20],
    x = d3.scale.ordinal().rangeRoundBands([p[0], h- p[2]]),
    y = d3.scale.linear().range([0, w-15]),
    capcolor = "#B53C36",
    uncapcolor = "#EAC881",
    z = d3.scale.ordinal().range(["white", capcolor, capcolor, capcolor, uncapcolor, uncapcolor, uncapcolor, uncapcolor, uncapcolor]);

var svg1 = d3.select("#" + where).append("svg:svg")
    .attr("width", w)
    .attr("height", h)
    .attr("fill", "#666")
  .append("svg:g")
    .attr("transform", "translate(0," + (h - p[2]) + ")")
    .attr("transform", "rotate(90)"); //Note that I'm doing this strangely because I'm lazily modifying bargraph.js - x and y axes end up inverted
    
    d3.csv(csvfile, function(data){
            
        // Transpose the data into layers by cause.
        var sectors = d3.layout.stack()(["Blank",  "Electric Power",  "Industrial", "Transportation","Agriculture and Forestry","Uncapped Electricity/ Industrial", "High Warming Potential Gases", "Other Uncapped"].map(function(cause){
            return data.map(function(d){
                return {
                    x: d.date,
                    y: +d[cause],
                    info: d.date,
                    policy: d.policy,
                    link: d.link
                };
            });
        }));
        

        function mouseOver(){
            var thisSector = d3.select(this);
            thisSector.selectAll("rect").style("fill-opacity", "1");
            thisSector.selectAll(".group-label").attr("visibility", "visible");
            groupname.html(thisSector.attr("desc"));
        }
        
        function mouseOut(){
            var thisSector = d3.select(this);
            thisSector.selectAll("rect").style("fill-opacity", "0.8");
            thisSector.selectAll(".group-label").attr("visibility", "hidden");
            groupname.html(sectornames[0]);
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
            .attr("desc", function(d,i){return sectornames[i];})
            .style("fill", function(d, i){
                return z(i);
            })
            .on("mouseover", mouseOver).on("mouseout", mouseOut);
       
       var policyrect = sector.selectAll(".policyrect")
            .data(Object)
            .enter()
            .append("rect")
            .style("fill", "white")
            .attr("transform", function(d){
                xcoord = x(d.x);
                return "translate(" + xcoord + ", 0) rotate(270)";
             })
            .attr("width", function(d, i){
                if (d.policy==='1' && d.y > 0 && d.y < 300) {
                    return w;
                }
            })
            .attr("height", x.rangeBand);
         
         var capData = [
            {value: 334.2, name: "Cap: 334.2"},
            {value: 427, name: "Goal: 427"}
            
         ];
         
         var capLine = svg1.selectAll("g.caplabels")
            .data(capData)
            .enter()
            .append("svg:g")
            .attr("class","subtext");
         
        capLine.append("svg:polygon")
            .attr("points", "0,0 10,0 5,10")
            .attr("transform", function(d){return "rotate(270) translate(" + (y(d.value)-5) +" " + (p[0]-5) + ")";});
        
        capLine.append("svg:text")
            .attr("transform", "rotate(-90)")
            .attr("x", function(d){ return y(d.value);})
            .attr("y", p[0]-5)
            .attr("dy", -2)
            .style("text-anchor", "middle")
            .text(function(d){return d.name;});
        
        capLine.append("svg:polygon")
            .attr("points", "0,10   10,10 5,0")
            .attr("transform", function(d){return "rotate(270) translate(" + (y(d.value)-5) +" " + (h-p[2]-5) + ")";})
        
        capLine.append("svg:text")
            .attr("transform", "rotate(-90)")
            .attr("x", function(d){ return y(d.value);})
            .attr("y", h-p[2]+5)
            .attr("dy", 11)
            .style("text-anchor", "middle")
            .text(function(d){return d.name;});
        
        // Add a rect for each date.
        var rect = sector.selectAll(".coloredrect").data(Object).enter().append("svg:rect")
            .attr("x", function(d){ return x(d.x);})
            .attr("y", function(d){ return (-y(d.y0) - y(d.y));})
            .attr("height", function(d){
                return y(d.y);
                })
            .style("stroke", "white")
            .style("fill",function(d, i){ 
                if((d.info=="2013"||d.info=="2014")&&d.y>180){return uncapcolor;} // THIS IS NOT ELEGANT
                })
            .attr("width", x.rangeBand())
           .style("fill-opacity", "0.8");
        
        var dots = sector.selectAll("circle")
         .data(Object)
         .enter().append("svg:circle")
         .attr("class", "group-label")
         .attr("visibility", "hidden")
         .attr("fill", "#666")
         .attr("cx", function(d) { return x(d.x) + x.rangeBand()/2; })
         .attr("cy", -6)//function(d) { return -y(d.y0) - y(d.y) -10; })
         .attr("r", function(d,i){if(d.policy==='1' && d.y>0 && d.y<300){return 3;} else{return 0;}});
        
        var policytext = sector.selectAll("text")
            .data(Object)
            .enter()
            .append("svg:a")
            .attr("xlink:href", function (d){return d.link;})
            .append("svg:text")
            .style("stroke", "blank")
            .style("fill", "#F96302")
            .attr("background-color", "yellow")
            .attr("transform", function(d){
                xcoord = x(d.x) + x.rangeBand() / 2 + 5;
                return "translate(" + xcoord + ",-15) rotate(270)";
             })
            .text(function(d, i){
                if (d.policy==='1' && d.y > 0 && d.y < 300) {
                    return d.info;
                }
            });
           
       
            
        var policynumbers = sector.selectAll(".numbers")
            .data(Object)
            .enter()
            .append("svg:text")
            .style("stroke", "blank")
            .style("fill", "#666")
            .style("text-anchor", "end")
            .attr("transform", function(d){
                xcoord = x(d.x) + x.rangeBand() / 2 + 5;
                return "translate(" + xcoord + "," + (-y(d.y0)) + ") rotate(270)";
             })
            .text(function(d, i){
                if (d.policy==='1' && d.y > 0 && d.y < 300) {
                    return "-" + d.y;
                }
            });
            
        
        
        // Add a label per date.
        var label = svg1.selectAll("g.labels").data(x.domain()).enter().append("svg:text").attr("x", 0)
        .attr("y", function(d){
            return x(d) + x.rangeBand() / 2;
            })
        .attr("text-anchor", "left")
        .attr("dy", ".25em")
        .attr("dx", "3px")
        .attr("fill","white")
        .attr("transform", "rotate(270)")
        .text(function(d, i){if(i==0 || i==14)
            {
                return d;
            }
        })
        .style("pointer-events","none");
        
        //add group info      
        var groupname = svg1
                .append('foreignObject')
                .attr("x", 0)
                .attr("y", 0)
                .attr("transform", "rotate(270)")
                .attr('width', w)
                .attr('height', p[0])
                .append("xhtml:p")
                .style("background-color","white")
                .html(sectornames[0]);
        
        d3.selectAll("p").style("stroke","red");
        
        // Add y-axis rules.
        var rule = svg1.selectAll("g.rule")
                .data(y.ticks(4))
            .enter().append("svg:g")
                .attr("class", "rule")
                .attr("transform", function(d){return "translate(" + (h - p[2]) + " " + -y(d) + ") rotate (270)";});
        
        rule.append("svg:text")
            .attr("class", "subtext")
            .attr("dy", "0.5em")
            .text(d3.format(",d"));
        
        // add y-axis label
        svg1.append("foreignObject")
            .attr("class", "subtext")
            .attr("transform", function(d){return "translate(" + (h - p[2] + 5) + " " + "0) rotate(270)";})
            .attr("width", w)
            .attr("height", "1.5em")
            .append("xhtml")
            .html('Annual Emissions (MMTCO<sub>2</sub>e)');
            
        keydata = [{name:'CAPPED', color: capcolor}, {name:'UNCAPPED', color: uncapcolor}];
        
        key = svg1.append('svg:g');
        key.selectAll("keyrect")
            .data(keydata)
            .enter().append("svg:rect")
            .attr("width", 100)
            .attr("x", function(d,i){
                return (i+1)/3*w-50;
            })
            .attr("y", h-p[2]+25)
            .attr("transform", "rotate(270)")
            .attr("height", "1.3em")
            .style("fill", function(d){return d.color});
        key.selectAll("text")
            .data(keydata)
            .enter().append('svg:text')
            .attr("x", function(d,i){
                return (i+1)/3*w;
            })
            .attr("y", h-p[2]+25)
            .attr("transform", "rotate(270)")
            .attr("text-anchor","middle")
            .style("fill", "white")
            .attr("dy", "1em")
            .text(function (d) {return d.name});

    });
}
