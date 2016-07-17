var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var jf = require('jsonfile');
var stream = fs.createWriteStream("./output/weather.json");

//Append file func
function appendObject(obj,path){
  var configFile = fs.readFileSync(path);
  var config = JSON.parse(configFile);
  config.push(obj);
  var configJSON = JSON.stringify(config);
  fs.writeFileSync(path, configJSON);
console.log(path);
};


//Parse Func
function parseURL(year,month, day){

    	var date = year+"/"+month+"/"+day;

	var url = 'https://www.wunderground.com/history/airport/LTBJ/'+ date + '/DailyHistory.html';
	console.log(url);

    request(url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);

            var city, date, year, month, day, dow, meanT, maxT, minT;
            var json = { city : "",date : "", date1 : "", year : "", month : "", day : "", dow : "", meanT : "", maxT : "", minT : ""};
	

		//CITY
		var city = $('.city-nav-header').text().trim();
		json.city = city;

		//DATE1
		var date1 = $('.history-date').first().text();
		json.date1 = date1;

		//DOW
		//json.dow = date1.split(",")[0];

		//divide url
		var splitted = url.split("/");

		//YEAR
		var year = splitted[6];
		json.year = year;

		//MONTH
		var month = splitted[7];
		json.month = month;

		//DAY
		var day = splitted[8];
		json.day = day;

		

		//DATE
		json.date = year + "-" + month + "-" + day;

		//mean =  $('.wx-value').first().text();
		 $('#historyTable').filter(function(){
				var data = $(this);
				mean = $('.wx-value').first().text();
				json.meanT = mean;
		})


		appendObject(json, './output/weather.json');

		/*
		stream.write(",");
		stream.write(JSON.stringify(json));
		stream.close();
		*/


		//fs.appendFileSync("output/weather.json", ",");
		//fs.appendFileSync("output/weather.json", JSON.stringify(json));




		// Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
		//res.send('Check your console!')


		}

	})
};//END OF PARSER FUNC
    


//APP PARSE
app.get('/parse', function(req, res){
    
//var start = new Date("01/01/2014");
var start = new Date("01/01/2012");
var end = new Date("06/13/2016");

console.log(start);
console.log(end);

/*
stream.write("[");
stream.close();    
*/
//fs.appendFileSync("output/weather.json", "[");


    while(start <= end){
    	var month = ((start.getMonth()+1)>=10)?(start.getMonth()+1):'0'+(start.getMonth()+1);
    	var day = ((start.getDate())>=10)? (start.getDate()) : '0' + (start.getDate());
    	var year = start.getFullYear();
    	//var date = day+"-"+month+"-"+year; //yyyy-mm-dd
    	//console.log(`${date + ""}`);           
	parseURL(year,month,day);

       	var newDate = start.setDate(start.getDate() + 1);
       	start = new Date(newDate);
    }
//fs.appendFileSync("output/weather.json", "]");
})


app.listen('8000')

console.log('Magic happens on port 8000');

exports = module.exports = app;


