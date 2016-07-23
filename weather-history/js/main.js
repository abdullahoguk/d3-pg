//python -m SimpleHTTPServer 8000

$(document).ready(function(){

//https://raw.githubusercontent.com/codeaia/chart-ui/gh-pages/data1.json
//http://localhost:8000/data1.json 
	d3.json("https://raw.githubusercontent.com/abdullahoguk/d3-pg/master/weather-history/weather.json", 
		function(error, data){
			if (error) return console.warn(error);
  			d=data;
  			height = 500;
  			width = 700;
  			padding = 100;



  			
  			var wholesvg = d3.select("#chart1").append("svg")
  				.attr("height", height+padding*2)
  				.attr("width",width+padding*2)
  				.attr("class","chartsvg")
  				.call(zoom);

  				var chartsvg = wholesvg.append('g')
  				.attr("class","chart")
  				.attr('transform', 'translate(' + padding + ',' + padding + ')')
  			
  			

			

  		})//end of callback function
})
