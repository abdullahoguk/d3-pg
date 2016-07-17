
var start = new Date("01/01/2014");
var end = new Date("06/13/2016");

console.log(start);
console.log(end);
    
    while(start <= end){
    	var month = ((start.getMonth()+1)>=10)?(start.getMonth()+1):'0'+(start.getMonth()+1);
    	var day = ((start.getDate())>=10)? (start.getDate()) : '0' + (start.getDate());
    	var year = start.getFullYear();
    	var date = day+"-"+month+"-"+year; //yyyy-mm-dd
      
      
      
       console.log(date);           

       var newDate = start.setDate(start.getDate() + 1);
       start = new Date(newDate);
    }


