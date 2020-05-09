
//Java script file for the line graph using the Chartist library
//*********** Start function declarations ***********/
// 1. create a function to parse a date into "month-year" format
function parseDate (date)
{
    var datePart = date.split('/');
    var mon = datePart[0].substring(0,2);
    var year = datePart[2].substring(0,4);
    return year.concat('-',mon);
}

// 2. create a funtion that sorts the keys by year, month
function sortObj(unsortedObj) {
  var sortedObj = Object.keys(unsortedObj)
  .sort()
  .reduce((acc, key) => ({
      ...acc, [key]: unsortedObj[key]
  }), {})
  return sortedObj;
}

// 3. create a function that returns the months array as months M1, M2, M3, etc.
function monthFormat(date){
  var months =[];
  date.forEach( function(each, index){
    // console.log(`index ${index+1} ${each}` );
    months.push('M'.concat(index+1));
  });
  return months;
}
//**************End function Declaration *****************/


//************ Start d3.json data processing block **********************/
d3.json("/trafficdata").then(function (response){

    var stopCount = {};
    for (i=0;i < response.length; i++)
    {
        var currentDate = parseDate(response[i].Date);
        if (currentDate in stopCount){
            stopCount[currentDate] +=1;
        } 
        else {
            stopCount[currentDate]=1;
        }
    
    }
    // sort the array of stops using the function aboe d3.json
    sortedObj = sortObj(stopCount);
    console.log(sortedObj);

    // create an array of keys 
    keys = Object.keys(sortedObj);  
    
    // convert the dates into the format M1..M24 using the funtion above d3.json
    var months = monthFormat(keys);
    console.log(months);
    
    // convert values into an array 
    values = Object.values(sortedObj);


    // >>>> create a "Chartist"  line graph
    var chart = new Chartist.Line('#chart2', {
      labels: months,
      series: [values],

    }, 
      {
      low: 0,
      showLine: false,
      // axisX: {
      //   showLabel: true,
      //   offset: 10
      // },
      // axisY: {
      //   showLabel: true,
      //   offset: 10
      // },
      // width: '800px',
      // height: '200px',
        
    });
    
    // >>>> Chartist aninamted time series chart code starts here...
    // Let's put a sequence number aside so we can use it in the event callbacks
    var seq = 0;

    // Once the chart is fully created we reset the sequence
    chart.on('created', function() {
      seq = 0;
    });
    
    // On each drawn element by Chartist we use the Chartist.Svg API to trigger SMIL animations
    chart.on('draw', function(data) {
      if(data.type === 'point') {
        // If the drawn element is a line we do a simple opacity fade in. This could also be achieved using CSS3 animations.
        data.element.animate({
          opacity: {
            // The delay when we like to start the animation
            begin: seq++ * 80,
            // Duration of the animation
            dur: 500,
            // The value where the animation should start
            from: 0,
            // The value where it should end
            to: 1
          },
          x1: {
            begin: seq++ * 80,
            dur: 500,
            from: data.x - 100,
            to: data.x,
            // You can specify an easing function name or use easing functions from Chartist.Svg.Easing directly
            easing: Chartist.Svg.Easing.easeOutQuart
          }
        });
      }
    });
    
    // For the sake of the example we update the chart every time it's created with a delay of 8 seconds
    chart.on('created', function() {
      if(window.__anim0987432598723) {
        clearTimeout(window.__anim0987432598723);
        window.__anim0987432598723 = null;
      }
      window.__anim0987432598723 = setTimeout(chart.update.bind(chart), 8000);
    });
    
    
      // >>>> Chartlist animated time series ends here 
        
//****************** End d3.json data processing block**************
 
}).catch( function(error){
    console.log(error);
});
