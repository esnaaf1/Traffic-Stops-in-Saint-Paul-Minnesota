// Main javascript file

//*********** Start function declarations ***********/
// 1. create a function to parse date into month-year
function parseDate (date)
{
    var datePart = date.split('/');
    var mon = datePart[0].substring(0,2);
    var year = datePart[2].substring(0,2);
    return year.concat('-',mon);
};

// 2. create a funtion that sorts the keys by year, month
function sortObj(unsortedObj) {
  var sortedObj = Object.keys(unsortedObj)
  .sort()
  .reduce((acc, key) => ({
      ...acc, [key]: unsortedObj[key]
  }), {})
  return sortedObj;
};

// 3. create a function that returns the months array as months M1, M2, M3, etc.
function monthFormat(date){
  var months =[];
  date.forEach( function(each, index){
    // console.log(`index ${index+1} ${each}` );
    months.push('M'.concat(index+1));
  });
  return months;
};

//4.  Create a function that displays the Chartist chart

function createChartist(data)
{

  var response = data;
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
  
  };
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
    
};

// 5. function that returns an array of occurances by a catetory
function rateByCategory(data, item) {
    
  var rate = {};

  for (i=0; i < data.length; i++) {
      var category = data[i][item];
      if (category in rate) {
          
          rate[category] +=1;
      }
      else {
          rate[category] =1;
      }
  }
  return rate;
};
// 6. Create a function that displays the Plotly data.

function createPlotly(data, layout) {

  Plotly.newPlot('plot', data, layout)

};

//**************************************************/
//***   Main d3 processing section starts here    */
//*************************************************/
d3.json('trafficdata').then(function(data) {
    console.log(data);
    // Subset the date by Reason, DriverSearched, Vehicle Searched
    var Equipment = data.filter(it => it.Reason.includes('Equipment Violation'));
    var Investigate = data.filter(it => it.Reason.includes('Investigative Stop'));
    var Moving = data.filter(it => it.Reason.includes('Moving Violation'));
    var Call = data.filter(it => it.Reason.includes('911 Call / Citizen Reported'));

    var DriverSearched = data.filter(it => it.DriverSearched.includes('Yes'));
    var VehicleSearched = data.filter(it => it.VehicleSearched.includes ('Yes'));

    var SelectedOption = d3.select("#selDataset").property("value");
    // Assign the value of the dropdown menu option to a variable
    console.log('SelectedOption ',SelectedOption );

    // set the option variable
    if (SelectedOption == "race"){
      var option = "Race";
      console.log("Race selected")
    } else if (SelectedOption =="gender"){
      var option = "Gender";
      console.log("Gender selected")
    }
    // Get counts of Reason, DriverSearced, VehicleSearced by Gender
    var countbyEquipment= rateByCategory(Equipment, option);
    var countbyInvestigate = rateByCategory(Investigate,option);
    var countbyMoving = rateByCategory(Moving,option);
    var countbyCall = rateByCategory(Call,option);
    var countbyDriverSearched = rateByCategory(DriverSearched, option);
    var countbyVehicleSearched = rateByCategory(VehicleSearched, option);

    //set up plotly traces
    var trace1 ={
        x: Object.keys(countbyEquipment),
        y: Object.values(countbyEquipment),
        name: 'Stop reason: Equipment Vilolation',
        type: 'bar',
        xaxis: 'x1'
    };

    var trace2 = {
        x: Object.keys(countbyInvestigate),
        y: Object.values(countbyInvestigate),
        name: 'Stop reason: Investigative Stop',
        type: 'bar',
        xaxis: 'x1'
    };
    var trace3 = {
        x: Object.keys(countbyMoving),
        y: Object.values(countbyMoving),
        name: 'Stop reason: Moving Violation',
        type: 'bar',
        xaxis: 'x1'
    };
    var trace4 = {
        x: Object.keys(countbyCall),
        y: Object.values(countbyCall),
        name: 'Stop reason: 911 Call/Citizen Reported',
        type: 'bar',
        xaxis: 'x1'
    };

    var trace5 = {
        x: Object.keys(countbyDriverSearched),
        y: Object.values(countbyDriverSearched),
        name: 'Driver Searched',
        type: 'bar',
        xaxis:'x2'
    };
    var trace6 = {
        x: Object.keys(countbyVehicleSearched),
        y: Object.values(countbyVehicleSearched),
        name: 'Vehicle Searched',
        type: 'bar',
        xaxis: 'x2'
    };

    var plotData =[trace1, trace2, trace3, trace4, trace5, trace6];

    // setup the layout
    var layout = {
            barmode: 'stack',
              xaxis: {
                domain: [0, 0.50],
                anchor: 'x1',
                automargin: true, 
                title: {
                  text: "Reason for Stops",
                  standoff: 30
                } 
              },
              xaxis2: {
                domain: [0.50, 1.0],
                anchor: 'x2',
                automargin: true, 
                title: {
                  text: "Driver/Vehicle Searched",
                  standoff: 30
                } 
              }
      };
    // create the Plotly bar chart
    createPlotly(plotData,layout);
    
    // create the Chartist animted chart
    createChartist(data);

    // set up an event listener on the selDataset dropdown menu
    d3.select("#selDataset").on("change", function(){
      var SelectedOption = d3.select("#selDataset").property("value");
      // Assign the value of the dropdown menu option to a variable
      console.log('SelectedOption ',SelectedOption );

      // set the option variable
      if (SelectedOption == "race"){
        var option = "Race";
        console.log("Race selected")
      } else if (SelectedOption =="gender"){
        var option = "Gender";
        console.log("Gender selected")
      }
      // Get counts of Reason, DriverSearced, VehicleSearced by Gender
      var countbyEquipment= rateByCategory(Equipment, option);
      var countbyInvestigate = rateByCategory(Investigate,option);
      var countbyMoving = rateByCategory(Moving,option);
      var countbyCall = rateByCategory(Call,option);
      var countbyDriverSearched = rateByCategory(DriverSearched, option);
      var countbyVehicleSearched = rateByCategory(VehicleSearched, option);

      //update plotly traces
      var trace1 ={
          x: Object.keys(countbyEquipment),
          y: Object.values(countbyEquipment),
          name: 'Stop reason: Equipment Vilolation',
          type: 'bar',
          xaxis: 'x1'
      };

      var trace2 = {
          x: Object.keys(countbyInvestigate),
          y: Object.values(countbyInvestigate),
          name: 'Stop reason: Investigative Stop',
          type: 'bar',
          xaxis: 'x1'
      };
      var trace3 = {
          x: Object.keys(countbyMoving),
          y: Object.values(countbyMoving),
          name: 'Stop reason: Moving Violation',
          type: 'bar',
          xaxis: 'x1'
      };
      var trace4 = {
          x: Object.keys(countbyCall),
          y: Object.values(countbyCall),
          name: 'Stop reason: 911 Call/Citizen Reported',
          type: 'bar',
          xaxis: 'x1'
      };

      var trace5 = {
          x: Object.keys(countbyDriverSearched),
          y: Object.values(countbyDriverSearched),
          name: 'Driver Searched',
          type: 'bar',
          xaxis:'x2'
      };
      var trace6 = {
          x: Object.keys(countbyVehicleSearched),
          y: Object.values(countbyVehicleSearched),
          name: 'Vehicle Searched',
          type: 'bar',
          xaxis: 'x2'
      };

      var plotData =[trace1, trace2, trace3, trace4, trace5, trace6];

      // update the layout
      var layout = {
        //  height: 600,
        //  width: 800,
          barmode: 'stack',
            xaxis: {
              domain: [0, 0.50],
              anchor: 'x1',
              automargin: true, 
              title: {
                text: "Reason for Stops",
                standoff: 30
              } 
            },
            xaxis2: {
              domain: [0.50, 1.0],
              anchor: 'x2',
              automargin: true, 
              title: {
                text: "Driver/Vehicle Searched",
                standoff: 30
              } 
            }
      };
      createPlotly(plotData,layout);
  
    });

}).catch (function (error) {
  console.log(error);
});