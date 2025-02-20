var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var jf = require('jsonfile');


//Append file func
var appendObject = function(obj,path){
  var configFile = fs.readFile(path);
  var config = JSON.parse(configFile);
  config.push(obj);
  var configJSON = JSON.stringify(config);
  fs.writeFile(path, configJSON);
console.log(path);
};


//Parse Func
var parseURL = function (year,month, day){

    	var date = year+"/"+month+"/"+day;

url = 'https://www.wunderground.com/history/airport/LTBJ/'+ date + '/DailyHistory.html';
console.log(url);

    request(url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);

            var city, date, year, month, day, dow, meanT, maxT, minT;
            var json = { city : "",date : "", date1 : "", year : "", month : "", day : "", dow : "", meanT : "", maxT : "", minT : ""};
	

//CITY
city = $('.city-nav-header').text().trim();
json.city = city;

//DATE1
date1 = $('.history-date').first().text();
json.date1 = date1;

//divide url
splitted = url.split("/");

//YEAR
year = splitted[6];
json.year = year;

//MONTH
month = splitted[7];
json.month = month;

//DAY
day = splitted[8];
json.day = day;

//DATE
json.date = year + "-" + month + "-" + day;

//mean =  $('.wx-value').first().text();
 $('#historyTable').filter(function(){
                var data = $(this);
                mean = $('.wx-value').first().text();
                 json.meanT = mean;
})


//appendObject(json, './output/weather.json');
fs.writeFile('output/weather.json', JSON.stringify(json, null, 4), function(err){

    console.log('File successfully written! - Check your project directory for the output.json file');

})

// Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
res.send('Check your console!')


}

})
};//END OF PARSER FUNC
    


//APP PARSE
app.get('/parse', function(req, res){
    
parseURL(2015,01,01);



    })


app.listen('8000')

console.log('Magic happens on port 8000');

exports = module.exports = app;


