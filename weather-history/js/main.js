//python -m SimpleHTTPServer 8000

$(document).ready(function(){

/*JSON file
[
	{
		"city":"Izmir, Turkey",
		"date":"2015-1-3",
		"date1":"Saturday, January 3, 2015",
		"year":"2015",
		"month":"1",
		"day":"3",
		"dow":"",
		"meanT":"4",
		"maxT":"",
		"minT":""
	}
]
*/
//https://raw.githubusercontent.com/abdullahoguk/d3-pg/master/weather-history/weather.json
	d3.json("http://localhost:8000/weather.json",
		function(error, data){
			if (error) return console.warn(error);

			//sort data by time
			d = data.sort(function comp(a, b) {
				return new Date(a.date).getTime() - new Date(b.date).getTime();});

			//Chart Prefs
  			height = 350;
  			width = 1000;
  			padding = 50;

			dotRadius = 3;
			dotStroke = dotRadius - 2;

			innerTickSize = 5;
			outerTickSize = 2;

			maxDays = 8;
			minDays = 4;

			//Scales
			tempSc = d3.scale.linear()
			    .domain([-15, 50])
			    .range([height,0]);


			var timeFormat = d3.time.format("%Y-%m-%d");

			timeDomain = d3.extent(d,function(element){
				return timeFormat.parse(element.date);
			});

			timeSc = d3.time.scale()
    			.domain(timeDomain)
				.range([0,width]);





			//DRAW
			var wholesvg = d3.select("#chart1").append("svg")
				.attr("height", height+padding*2)
				.attr("width",width+padding*2)
				.attr("class","chartsvg");


			var chartsvg = wholesvg.append('g')
				.attr("class","chart")
				.attr('transform', 'translate(' + padding + ',' + padding + ')');




			//LINES
				line = d3.svg.line()
					.x(function(d) {return timeSc(new Date(d.date)); })
					.y(function(d) {return tempSc(d.meanT)});
				var lines = chartsvg.append("path")
					.data([d])
					.attr("class", "line")
					.attr("d", line(d) )
					.attr("transform", "translate(0,0)")

				//DOTS GROUP(each of them contains a circle and text)


					var dotsg = chartsvg.selectAll("g.dotsg")
						.data(d)
						.enter()
						.append("g")
						.attr("class","dotsg")
						.attr("transform", "translate(0,0)");


					var dots = dotsg.append("circle")
							.attr("class","dots")
							.attr("cx", function(d){
								return timeSc(new Date(d.date))
							})
							.attr("cy", function(d){return tempSc(d.meanT)})
							.attr("r", dotRadius);

						dotsg.append("text")
							.text(function(d){return d.meanT})
							.attr("class","valueText")
							.attr("x", function(d){return timeSc(timeFormat.parse(d.date))})
							.attr("y", function(d){return tempSc(d.meanT)-25})
							.style("display","none")
							.attr("text-anchor", "middle");



			//AXISES
				xAxis = d3.svg.axis().scale(timeSc)
						.orient("bottom")
						.ticks(d.length/100)
						.tickSize(innerTickSize,outerTickSize);

				yAxis = d3.svg.axis().scale(tempSc)
						.orient("left")
						.ticks(10)
						.tickSize(innerTickSize,outerTickSize)


				chartsvg.append("svg:g")
					.attr("class" , "xaxis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis);



				chartsvg.append("svg:g")
					.attr("class" , "yaxis")
					.attr("transform", "translate(0, 0)")
					.call(yAxis)


//-------------------------------------------------------NEW


var area = d3.svg.area()
    .interpolate("step-after")
    .x(function(d) { return timeSc(new Date(d.date)); })
    .y0(tempSc(0))
    .y1(function(d) { return tempSc(d.meanT); });

pane = chartsvg.append("rect")
	.attr("class", "pane")
	.attr("width", width)
	.attr("height", height)
	.call(
		d3.behavior.zoom()
		.x(timeSc)
		.scaleExtent([1, 10])
		.on("zoom", function(){
			chartsvg.attr("transform","translate("
		+ d3.event.translate
		+ ")scale(" + d3.event.scale + ")");
		chartsvg.select("g.x.axis").call(xAxis);
	  	chartsvg.select("g.y.axis").call(yAxis);
		chartsvg.select("path.line").attr("d", line);
		chartsvg.select("path.area").attr("d", area);
		})
	);




var zoom = d3.behavior.zoom()
	.x(timeSc)
	.scaleExtent([1,2])
	.on("zoom", function(){
/*
		var t = zoom.translate(),
	      tx = t[0],
	      ty = t[1];

		tx = Math.min(1, Math.max(tx, width - Math.round(timeSc(maxDays) - timeSc(1)), width - Math.round(timeSc(maxDays) - timeSc(1)) * d3.event.scale))
		zoom.translate([tx, ty])
*/

	chartsvg.attr("transform","translate("
+ d3.event.translate
+ ")scale(" + d3.event.scale + ")");

	  chartsvg.select("g.x.axis").call(xAxis);
	  chartsvg.select("g.y.axis").call(yAxis);
	 // chartsvg.select("path.area").attr("d", area);
	  chartsvg.select("path.line").attr("d", line);
		//chartsvg.select("circle.dots").attr("d", dots);
		chartsvg.select(".dotsg").call(dots);

	//draw();
});


//    draw();


function draw() {
	/*
	var t = zoom.translate(),
      tx = t[0],
      ty = t[1];

	tx = Math.min(1, Math.max(tx, width - Math.round(timeSc(maxDays) - timeSc(1)), width - Math.round(timeSc(maxDays) - timeSc(1)) * d3.event.scale))
	zoom.translate([tx, ty])
*/
  chartsvg.select("g.x.axis").call(xAxis);
  chartsvg.select("g.y.axis").call(yAxis);
 // chartsvg.select("path.area").attr("d", area);
  chartsvg.select("path.line").attr("d", line);
}

/*

var area = d3.svg.area()
    .interpolate("step-after")
    .x(function(d) { return timeSc(new Date(d.date)); })
    .y0(tempSc(0))
    .y1(function(d) { return tempSc(d.meanT); });

var line = d3.svg.line()
    .interpolate("step-after")
    .x(function(d) { return timeSc(new Date(d.date)); })
    .y(function(d) { return tempSc(d.meanT); });




	var gradient = chartsvg.append("defs").append("linearGradient")
	    .attr("id", "gradient")
	    .attr("x2", "0%")
	    .attr("y2", "100%");

	gradient.append("stop")
	    .attr("offset", "0%")
	    .attr("stop-color", "#fff")
	    .attr("stop-opacity", .5);

	gradient.append("stop")
	    .attr("offset", "100%")
	    .attr("stop-color", "#999")
	    .attr("stop-opacity", 1);


var xAxis = d3.svg.axis()
    .scale(timeSc)
    .orient("bottom")
	.ticks(d.length/100)
    .tickSize(innerTickSize,outerTickSize)
    .tickPadding(6);

var yAxis = d3.svg.axis()
    .scale(tempSc)
    .orient("left")
	.ticks(10)
    .tickSize(innerTickSize,outerTickSize)
    .tickPadding(6);




	chartsvg.append("g")
	    .attr("class", "yaxis")
	    .attr("transform", "translate(" + 0 + ",0)");

	chartsvg.append("path")
	    .attr("class", "area")
	    .attr("clip-path", "url(#clip)")
	    .style("fill", "url(#gradient)");

	chartsvg.append("g")
	    .attr("class", "xaxis")
	    .attr("transform", "translate(0," + height + ")");

	chartsvg.append("path")
	    .attr("class", "line")
	    .attr("clip-path", "url(#clip)");

	chartsvg.append("rect")
	    .attr("class", "pane")
	    .attr("width", width)
	    .attr("height", height)
	    .call(zoom);




  chartsvg.select("path.area").data([data]);
  chartsvg.select("path.line").data([data]);
  draw();


function draw() {
  chartsvg.select("g.x.axis").call(xAxis);
  chartsvg.select("g.y.axis").call(yAxis);
  chartsvg.select("path.area").attr("d", area);
  chartsvg.select("path.line").attr("d", line);
}
*/
//-------------------------------------------------------------NEW





				//NAME
					var name = wholesvg.append("text")
						.data(d)
						.attr("class","nameText")
						.text(function(d){return d.city})
						.attr("x" , (width+(2*padding))/2)
						.attr("y", height+2*padding-15)
						.attr("text-anchor", "middle");


						//STYLE AND LISTENERS

								$(".dots").on('mouseenter',function(){
										$(this).animate({'stroke': 'rgb(141, 140, 137)','stroke-width': 0},100)
										$(this).animate({'stroke': 'rgb(255, 173, 6)','stroke-width': dotStroke+3},100)

									})

										$(".dots").on('mouseleave',function(){
										$(this).animate({'stroke': 'rgb(255, 173, 6)','stroke-width': 0},100)
										$(this).animate({'stroke': 'rgb(141, 140, 137)','stroke-width': dotStroke},100)

									})


								dotsg.on("mouseenter",function(d,i){
									g = d3.select(this);
									circle = g.select("circle");
									text = g.select(".valueText");
									text.style("display","block");
									text.text(d.meanT)

								})

								dotsg.on("mouseleave",function(d,i){
									g = d3.select(this);
									circle = g.select("circle");
									text = g.select(".valueText");
									text.style("display","none");

								})

									var a = function(){
										$('.dots').animate({'fill' : 'rgb(251, 117, 96)','stroke': 'rgb(245, 34, 18)','stroke-width': dotStroke + 16},400)
										$('.dots').animate({'fill' : 'rgb(251, 117, 96)','stroke': 'rgb(245, 34, 18)','stroke-width': dotStroke - 2},200)

										$('.dots').animate({'fill' : 'rgb(251, 117, 96)','stroke': 'rgb(245, 34, 18)','stroke-width': dotStroke},150)

									}
									setTimeout(a,300);



  		})//end of callback function
})
