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
	d3.json("https://raw.githubusercontent.com/abdullahoguk/d3-pg/master/weather-history/weather.json",
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
				.attr("class","chartsvg")

			var chartsvg = wholesvg.append('g')
				.attr("class","chart")
				.attr('transform', 'translate(' + padding + ',' + padding + ')');


/*
			//LINES
				line = d3.svg.line()
					.x(function(d) {return timeSc(new Date(d.date)); })
					.y(function(d) {return tempSc(d.meanT)});


				var lines = chartsvg.append("path")
					.data([d])
					.attr("class", "line")
					.attr("d", line(d) )
					.attr("transform", "translate(40,0)")


*/
				//DOTS GROUP(each of them contains a circle and text)


					var dotsg = chartsvg.selectAll("g.dotsg")
						.data(d)
						.enter()
						.append("g")
						.attr("class","dotsg")
						.attr("transform", "translate(0,0)")

						dotsg.append("circle")
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
