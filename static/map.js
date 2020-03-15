/******************************************************* */
// Start with setup variables
/******************************************************* */
// Grab the geojson outline data
const stPaulPrecincts = "static/Saint_Paul_Police_Grid.geojson";
const stPaulDistricts = "static/District_Council_Shapefile_Map.geojson";

// Grab the traffic data
const trafficdataPath = "/trafficdata";
const startLocation = [44.95, -93.09];

// Define colors in one place
var min = 0;
var max = 1;
var backColor = 0;
var strColor = 1;
var choroColor = {
    'TrafficStops': ["#FFFFFF", "#071696"],
    'White': ["#FFFFFF", "#C0539E"],
    'Black': ["#FFFFFF", "#1371BA"],
    'Asian': ["#FFFFFF", "#06924A"],
    'Latino': ["#FFFFFF", "#5C396D"],
    'NativeAmerican': ["#FFFFFF", "#FFD700"],
    'Other': ["#FFFFFF", "#F18C20"],
    'Male': ["#FFFFFF", "#62B6E3"], 
    'Female': ["#FFFFFF", "#EB88CB"],
    'Searched': ["#FFFFFF", "#4F0617"],
    'MaleSearched': ["#FFFFFF", "#0972AB"],
    'FemaleSearched': ["#FFFFFF", "#F016AB"]
};
var pinColor = {
    'TrafficStops': ["#071696", "darkblue"],
    'White': ["#C0539E", "pink"],
    'Black': ["#1371BA", "blue"],
    'Asian': ["#06924A", "green"],
    'Latino': ["#5C396D", "purple"],
    'NativeAmerican': ["#FFD700", "yellow"],
    'Other': ["#F18C20", "orange"],
    'Male': ["#62B6E3", "lightblue"], 
    'Female': ["#EB88CB", "lightpink"],
    'Searched': ["#4F0617", "brown"],
    'MaleSearched': ["#0972AB", "darkblue"],
    'FemaleSearched': ["#F016AB", "darkpink"]
};

// Define Plot X-Axis Labels
var xAxisLabels = ['White', 'Black', 'Asian', 'Latino', 'Other', 'Native American'];
var pieLabels = ['Male Not Searched', 'Female Not Searched', 'Male Searched', 'Female Searched'];
var barColors = [choroColor.White[max], choroColor.Black[max], choroColor.Asian[max], choroColor.Latino[max],
choroColor.Other[max], choroColor.NativeAmerican[max]];
var pieColors = [choroColor.Male[max],choroColor.Female[max],choroColor.MaleSearched[max],choroColor.FemaleSearched[max]];

// // define the overlays
var overlays = {
    "TrafficStops":     {"name" : "TrafficStops","label" : "Traffic Stops", "geojson": "", "legend": L.control({ position: "topright" }), "info": L.control({ position: "topright" })},
    "White":            {"name" : "White", "label" : "Race: White", "geojson": "", "legend": L.control({ position: "topright" }), "info": L.control({ position: "topright" })},
    "Black":            {"name" : "Black", "label" : "Race: Black", "geojson": "", "legend": L.control({ position: "topright" }), "info": L.control({ position: "topright" })},
    "Asian":            {"name" : "Asian", "label" : "Race: Asian", "geojson": "", "legend": L.control({ position: "topright" }), "info": L.control({ position: "topright" })},
    "Latino":           {"name" : "Latino", "label" : "Race: Latino", "geojson": "", "legend": L.control({ position: "topright" }), "info": L.control({ position: "topright" })},
    "NativeAmerican":   {"name" : "NativeAmerican", "label" : "Race: Native American", "geojson": "", "legend": L.control({ position: "topright" }), "info": L.control({ position: "topright" })},
    "Other":            {"name" : "Other", "label" : "Race: Other", "geojson": "", "legend": L.control({ position: "topright" }), "info": L.control({ position: "topright" })},
    "Female":           {"name" : "Female", "label" : "Gender: Female", "geojson": "", "legend": L.control({ position: "topright" }), "info": L.control({ position: "topright" })},
    "Male":             {"name" : "Male", "label" : "Gender: Male", "geojson": "", "legend": L.control({ position: "topright" }), "info": L.control({ position: "topright" })},
    "Searched":         {"name" : "Searched", "label" : "Searched", "geojson": "", "legend": L.control({ position: "topright" }), "info": L.control({ position: "topright" })},
    "Pins":             {"name" : "Pins", "label" : "Traffic Stop Locations", "geojson": "", "legend": L.control({ position: "topleft" }), "info": L.control({ position: "topright" })}
};

// Variable for tracking number of stops within a grid number
// will need to add this count to the geo json for the choropleth
// It will also be used for our plots
var countsByGrid = {
    "TrafficStops": {},
    "White": {},
    "Black": {},
    "Asian": {},
    "Latino": {},
    "NativeAmerican": {},
    "Other": {},
    "Female": {},
    "Male": {},
    "Searched": {},
    "SearcedByType": {'White':{}, 'Black':{}, 'Asian': {}, 'Latino':{}, 'NativeAmerican':{}, 'Other':{}, 'Female':{}, 'Male':{}}
};

// Variable for tracking the total number of stops
// This will be used for our plots
var countsByType = {
    "TrafficStops": 0,
    "White": 0,
    "Black": 0,
    "Asian": 0,
    "Latino": 0,
    "NativeAmerican": 0,
    "Other": 0,
    "Female": 0,
    "Male": 0,
    "Searched": {'White':0, 'Black':0, 'Asian': 0, 'Latino':0, 'NativeAmerican':0, 'Other':0, 'Female':0, 'Male':0} 
}

/******************************************************* */
// Define functions
/******************************************************** */

// function to convert location to an array of lattidue and longitude
function lat_lon(location)
{
    var lat_lon = location.split(',');
    latitude = lat_lon[0].substring(1, lat_lon[0].length);
    longitude = lat_lon[1].substring(0, lat_lon[1].length-1 );
    return {lat: latitude, lon: longitude};
};

// Function to calculate stops by gridnum
function calculateStopsByGrid(data)
{
    for (i=0; i<data.length; i++)
    {
        // Convert to Int to remove .0 then back to string
        // and increment or start count accordingly
        var gridNum = (data[i].Grid === "367") ? "267" : data[i].Grid;

        var currentGrid = parseInt(gridNum).toString();
        (currentGrid in countsByGrid.TrafficStops) ? countsByGrid.TrafficStops[currentGrid] += 1 : countsByGrid.TrafficStops[currentGrid] = 1;
        countsByType.TrafficStops += 1;

        // increment for race
        let race = (data[i].Race).replace(/ +/g, "");
        (currentGrid in countsByGrid[race]) ? countsByGrid[race][currentGrid] += 1 : countsByGrid[race][currentGrid] = 1;
         countsByType[race] += 1;

        // increment for gender
        let gender = data[i].Gender;
        (currentGrid in countsByGrid[gender]) ? countsByGrid[gender][currentGrid] += 1 : countsByGrid[gender][currentGrid] = 1;
        countsByType[gender] += 1;

        // increment for searches of either kind, total and broken out by race or gender
        if (data[i].VehicleSearched === "Yes" || data[i].DriverSearched === "Yes")
        {
            (currentGrid in countsByGrid.Searched) ? countsByGrid.Searched[currentGrid] += 1 : countsByGrid.Searched[currentGrid] = 1;
            (currentGrid in countsByGrid.SearcedByType[gender]) ? countsByGrid.SearcedByType[gender][currentGrid] += 1 : countsByGrid.SearcedByType[gender][currentGrid] = 1;
            (currentGrid in countsByGrid.SearcedByType[race]) ? countsByGrid.SearcedByType[race][currentGrid] += 1 : countsByGrid.SearcedByType[race][currentGrid] = 1;  
            countsByType.Searched[gender] += 1;
            countsByType.Searched[race] += 1;
        }
    }
    return countsByType;
}

// Add properties and counts to the geojson file
function addCountsToGeojson(data)
{
    // Loop through the geojson file to add the property stop count
    for (c=0; c<data.features.length; c++)
    {
        // Create temp variables
        let gridNum = data.features[c].properties.gridnum;
        let properties = data.features[c].properties;

        // NOTE:  The geojson file has an error in gridnum that we are correcting here
        if (gridNum === "367")
        {
            gridNum = "267";
            data.features[c].properties.gridnum = "267";
        }

        // Check first if the grid is valid, if so assign the count otherwise set to 0
        properties.TrafficStops = (gridNum in countsByGrid.TrafficStops) ? countsByGrid.TrafficStops[gridNum] : 0;
        properties.White = (gridNum in countsByGrid.White) ? countsByGrid.White[gridNum] : 0;
        properties.Black = (gridNum in countsByGrid.Black) ? countsByGrid.Black[gridNum] : 0;
        properties.Asian = (gridNum in countsByGrid.Asian) ? countsByGrid.Asian[gridNum] : 0;
        properties.Latino = (gridNum in countsByGrid.Latino) ? countsByGrid.Latino[gridNum] : 0;
        properties.NativeAmerican = (gridNum in countsByGrid.NativeAmerican) ? countsByGrid.NativeAmerican[gridNum] : 0;
        properties.Other = (gridNum in countsByGrid.Other) ? countsByGrid.Other[gridNum] : 0;
        properties.Female = (gridNum in countsByGrid.Female) ? countsByGrid.Female[gridNum] : 0;
        properties.Male = (gridNum in countsByGrid.Male) ? countsByGrid.Male[gridNum] : 0;
        properties.Searched = (gridNum in countsByGrid.Searched) ? countsByGrid.Searched[gridNum] : 0;
    }
}

// Code to highlight a grid on hover from a sample on leafletjs.com/examples/choropleth
function highlightFeature(e) {
    var layer = e.target;
    
    // highlights grid
    layer.setStyle({
        weight: 3,
        color: 'red',
        dashArray: ''
    });

    // Updates the plots with grid counts
    plotGridData(layer.feature.properties);

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

// Code to remove the highlist and switch back to the totals for plots
function resetHighlight(e) {
    var layer = e.target;

    // unhighlights grid
    layer.setStyle({
        weight: 1,
        color: 'white',
        dashArray: ''
    });

    // Updates plots with total counts
    plotTotalData();
}

// Function to call our highlight/reset calls based on mouse hovering
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
}
// End adding code from a sample on leafletjs.com/examples/choropleth


// Function to create a choropleth
function createChoropleth(currentLayer, data)
{
    return L.choropleth(data, 
    {
        // Define what  property in the features to use
        valueProperty: currentLayer.name,

        // Set color scale
        scale: choroColor[currentLayer.name],

        // Number of breaks in step range
        steps: 8,

        // q for quartile, e for equidistant, k for k-means
        mode: "k",
        style: {
            // Border color
            color: "#fff",
            weight: 1,
            fillOpacity: 0.8
        },

        // Binding a mouseover and mouse out on each feature
         onEachFeature: function(feature, layer) {

            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight
            });

        }
    }).addTo(groupedOverlays.Overlays[currentLayer.name]);
}

// Function to create choropleth legend
function createLegend(geojson, label, legend) 
{
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var limits = geojson.options.limits;
        var colors = geojson.options.colors;

        div.innerHTML = '<span>' + label + '</span><hr>';

        limits.forEach(function(limit, index) {
            div.innerHTML +=
            '<i style="background-color:' + colors[index] + ';text-align:center;"></i>' 
            + '<font color=\"navy\">' + limits[index].toFixed(0) + '</font>'
             + '<br />';
        });
        return div;
    };
}

// Function to create an icon
function createIcon(type, iColor, mColor, form)
{
    return L.ExtraMarkers.icon({
        icon: type,
        iconColor: iColor,
        markerColor: mColor,
        shape: form
    }); 
}

// Function to create Choropleth overlays
function createChoroplethOverlays(data)
{
    for (var key in overlays)
    {
        // NOTE:  The Pins Layer has its own legend
        if (key != "Pins")
        {
            let currentLayer = overlays[key];
            currentLayer.geojson = createChoropleth(currentLayer, data);
            createLegend(currentLayer.geojson, currentLayer.name, currentLayer.legend);
        }
    }
}

// Function to create the pins for each stop
function createPins(response)
{
    // Create a marker cluster group
    var markers = L.markerClusterGroup();
    
    // Loop through data
    for (var i = 0; i < response.length; i++) 
    {
        let searched = "No";

        // Set the data location property to a variable
        var location = lat_lon(response[i].Location);

        // Check for location property
        if (location) 
        {
            let selectedIcon, iconType, iconColor;

            // If there was a search, we will use an alert icon, otherwise male or female sign
            if (response[i].DriverSearched === "Yes" || response[i].VehicleSearched === "Yes")
            {
                iconType = "ion-alert";
                iconColor = "red";
                searched = "Yes";
            }
            else
            {
                iconType = response[i].Gender === "Female" ? "ion-female" : "ion-male";
                iconColor = "white";
                searched = "No";
            }

            var race = (response[i].Race).replace(/ +/g, "");
            selectedIcon = createIcon(iconType, iconColor, pinColor[race][strColor], "square");
    
            var grid = response[i].Grid === "367" ? "267" : response[i].Grid;

            // Now add the marker at the proper location and create the popup
            markers.addLayer(L.marker([location.lat, location.lon], {icon: selectedIcon})
                .bindPopup("<div><b>" /*+ "Reason: "*/ +  response[i].Reason + "</b></div><hr>"
                    + "<div>" + response[i].Race + " " + response[i].Gender + "</div>"
                    + "<div>Ticket Issued: " +  response[i].Citation + "</div>"
                    + "<div>Driver and/or Vehicle Searched:  " + searched + "</div>"
                    + "<div>Date:  " + response[i].Date + "</div>"
                    + "<div>Grid Number:  " + response[i].Grid + "</div>"
            ));
        }
    }

    // Add our marker cluster layer to the map  
    markers.addTo(groupedOverlays.Pins.Pins);
}

// Create Pin Legend
function createPinLegend(legend)
{
    legend.onAdd = function() 
    {
        var div = L.DomUtil.create("div", "pinlegend");
        var pinLabels = [];

        // Add min & max
        var legendInfoPin = "<div></div>";

        div.innerHTML = legendInfoPin;

        // Blue: 1371BA, Orange: F18C20, Pink: C0539E, Purple: 5C396D, Green: 06924A, Yellow: FFD700 
        let liStyle1 = "<li style=\"background-color: ";
        let liStyle2a = ";list-style-type:none;text-align:center;\"><font color=\"white\">";
        let liStyle2b = "white;list-style-type:none;text-align:center;\"><font color=\"black\"><span class=\"ion-male\">";
        let liStyle2c = "white;list-style-type:none;text-align:center;\"><font color=\"black\"><span class=\"ion-female\">";
        let liStyle2d = "white;list-style-type:none;text-align:center;\"><font color=\"black\"><span class=\"ion-alert\">";
        let liStyle3a = "</font></li>";
        let liStyle3b = "</span></font></li>";

        pinLabels.push("<li style=list-style-type:none;text-align:center;\">" + "<h5><font color=\"black\">Icons</font></h5></li>");
        pinLabels.push(liStyle1 + pinColor["White"][backColor] + liStyle2a + "White" + liStyle3a);
        pinLabels.push(liStyle1 + pinColor["Black"][backColor] + liStyle2a + "Black" + liStyle3a);
        pinLabels.push(liStyle1 + pinColor["Latino"][backColor] + liStyle2a + "Latino" + liStyle3a);
        pinLabels.push(liStyle1 + pinColor["Asian"][backColor] + liStyle2a + "Asian" + liStyle3a);
        pinLabels.push(liStyle1 + pinColor["Other"][backColor] + liStyle2a + "Other" + liStyle3a);
        pinLabels.push(liStyle1 + pinColor["NativeAmerican"][backColor] + liStyle2a + "Native American" + liStyle3a);

        pinLabels.push(liStyle1 + liStyle2b + "   Male" + liStyle3b);
        pinLabels.push(liStyle1 + liStyle2c + "   Female" + liStyle3b);
        pinLabels.push(liStyle1 + liStyle2d + "   Searched" + liStyle3b);

        div.innerHTML += "<ul>" + pinLabels.join("") + "</ul>";

        return div;
    };
}

// Function to create the geojson outline of regions
function createGeojsonOverlay(data, overlay, outlineColor)
{
    L.geoJson(data, 
    {
        // Style each feature (in this case a neighborhood)
        style: function(feature) 
        {
        return {
            color: outlineColor,
            fillOpacity: 0.0,
            weight: 1.0
        };
        }
    }).addTo(overlay);
}

/****************************************************** */
// Start Map Creation
/****************************************************** */
var groupedOverlays = {
    "Overlays": {
        "TrafficStops":     L.layerGroup(),
        "White":            L.layerGroup(),
        "Black":            L.layerGroup(),
        "Asian":            L.layerGroup(),
        "Latino":           L.layerGroup(),
        "NativeAmerican":   L.layerGroup(),
        "Other":            L.layerGroup(),
        "Female":           L.layerGroup(),
        "Male":             L.layerGroup(),
        "Searched":         L.layerGroup(),        
        "Precincts":        L.layerGroup(),
        "Districts":        L.layerGroup(),
        "None":             L.layerGroup()
    },
     "Pins": {
        "Pins":             L.layerGroup()
    }
};

var options = {
    exclusiveGroups: ["Overlays"],
    groupCheckBoxes: true
};

// Create map object
var stPaulMap = L.map("map", {
    center: startLocation,
    zoom: 12,
    // layers: [baseMaps.Outdoors, overlayMaps.TrafficStops]
    layers: [baseMaps.Outdoors, groupedOverlays.Overlays.TrafficStops]
  });

// Pass our map layers into our layer control
// Add the layer control to the map
L.control.groupedLayers(baseMaps, groupedOverlays, options).addTo(stPaulMap);

/***************************************************************** */
// Use d3 to do the magic
/***************************************************************** */

// Grab the data with d3
d3.json(trafficdataPath).then(function(response, err) 
{
    // cut to error function if problem comes up in code
    if (err) throw err;
    
    // Calculate how many stops in each grid
    countsByType = calculateStopsByGrid(response);

    // Create the pins that represent each stop
    createPins(response);

    // Grabbing our GeoJSON data..
    d3.json(stPaulPrecincts).then(function(data, err) 
    {
        // cut to error function if problem comes up in code
        if (err) throw err;

        // For each Precinct Grid, add the filtered traffic stops
        // IF the property does not exist, add it
        addCountsToGeojson(data);

        // Create new Choropleth overlays
        createChoroplethOverlays(data);

        // Add the Traffic Stop totals as the default legend
        overlays.TrafficStops.legend.addTo(stPaulMap);

        // Creating a geoJSON layer with the retrieved data
        createGeojsonOverlay(data, groupedOverlays.Overlays.Precincts, "orange");

        // Set up the pin legend
        createPinLegend(overlays.Pins.legend);

        plotTotalData();
    });
});

d3.json(stPaulDistricts).then(function(data, err) 
{
    // cut to error function if problem comes up in code
    if (err) throw err;

    // Creating a geoJSON layer with the retrieved data
    createGeojsonOverlay(data, groupedOverlays.Overlays.Districts, "green");
});

// Render the legend when an overlay is selected
stPaulMap.on('overlayadd', function (eventLayer) 
{
    if (eventLayer.name in overlays)
        overlays[eventLayer.name].legend.addTo(stPaulMap);
});

// Remove the legend when an overlay is de-selected
stPaulMap.on('overlayremove', function (eventLayer) 
{
    if (eventLayer.name in overlays)
        stPaulMap.removeControl(overlays[eventLayer.name].legend);
});

function plotPie(pieValues)
{
    // Pie Chart
    var data = [{
        values: pieValues,
        labels: pieLabels,
        type: 'pie',
        name: 'Gender',
        marker: { colors: pieColors }
    }];

    var layout = {
        title: 'Gender',
        height: 300,
        width: 400
    };

    Plotly.newPlot('gender', data, layout);
}

function plotMixedChart(scatterValues, barValues)
{
    // Scatter plot
    var trace1 = {
        x: xAxisLabels,
        y: scatterValues,
        type: 'scatter',
        name: 'Searched',
        marker: { color: choroColor.Searched[max] }
    };
  
    // Bar plot
    var trace2 = {
        x: xAxisLabels,
        y: barValues,
        type: 'bar',
        name: 'Race',
        marker: { color: barColors }
    };

    var layout2 = {
        title: 'Race and Searched',
        legend: {
            "orientation": "h",
            x: 1,
            y: 1,
            xanchor: 'right'
        },
        xaxis: { title: 'Race' },
        yaxis: { title: 'Count' }
    };

    var plotData = [trace1, trace2];
    
    Plotly.newPlot('race', plotData, layout2);
}

function plotData(pieValues, scatterValues, barValues, title)
{
    // Title
    document.getElementById("title").innerHTML = '<h4>' + title + '</h4><hr>';

    // Pie Chart
    plotPie(pieValues);

    // Scatter / Bar Chart
    plotMixedChart(scatterValues, barValues);
}

function plotSummary(columns, rows)
{
    // Create the header row of the table
    var html = '<table class=\"table table-striped table-bordered table-hover\"><thead><tr>';
    for(i=0; i<columns.length; i++)
        html += '<th scope=\"col\">' + columns[i] + '</th>';
    
    // Finish off header row and start body
    html += '</tr></thead><tbody>';

    // Fill in the table data
    for(r=0; r<rows.length; r++)
    {   
        html += '<tr>';
        for(e=0; e<rows[r].length; e++)
        {
            (e==0) ? html += '<th scope=\"row\">' + rows[r][e] + '</th>' : html += '<td>' + rows[r][e].toFixed(0) + '</td>';
        }
        html += '</tr>';
    }
    html += '</tbody></table>';

    document.getElementById("summary-table").innerHTML = html;
}

function plotGridData(properties) 
{
    // Grab the current grid number and create the title by district and grid
    var grid = properties.gridnum;
    var title = properties.dist + '   [' + properties.gridnum + ']';

    // Ensure values exist, otherwise set to 0
    var columnz = ['Metrics'];
    var rowz = [['Total'],['Searched'],['% Searched']];
    for (var key in countsByGrid.SearcedByType)
    {
        columnz.push(key);
        if(!countsByGrid[key][grid]) countsByGrid[key][grid] = 0;
        if(!countsByGrid.SearcedByType[key][grid]) countsByGrid.SearcedByType[key][grid] = 0;
        rowz[0].push(countsByGrid[key][grid]);
        rowz[1].push(countsByGrid.SearcedByType[key][grid]);
        if(countsByGrid[key][grid] == 0)
            rowz[2].push(0.0);
        else
            rowz[2].push(100.0 * countsByGrid.SearcedByType[key][grid] / countsByGrid[key][grid]);
    }

    // Create a list of gender and gender searched counts for this grid
    var pieValues = [countsByGrid.Male[grid] - countsByGrid.SearcedByType.Male[grid], countsByGrid.Female[grid] - countsByGrid.SearcedByType.Female[grid],
        countsByGrid.SearcedByType.Male[grid], countsByGrid.SearcedByType.Female[grid]];

    // Create a list of searched counts by race for this grid
    var scatterValues = [countsByGrid.SearcedByType.White[grid], countsByGrid.SearcedByType.Black[grid], countsByGrid.SearcedByType.Asian[grid], 
        countsByGrid.SearcedByType.Latino[grid], countsByGrid.SearcedByType.Other[grid], countsByGrid.SearcedByType.NativeAmerican[grid]];

    // Create a list of race counts for this grid
    var barValues = [countsByGrid.White[grid], countsByGrid.Black[grid], countsByGrid.Asian[grid], countsByGrid.Latino[grid],
        countsByGrid.Other[grid], countsByGrid.NativeAmerican[grid]];

    // Plot the values
    plotData(pieValues, scatterValues, barValues, title);

    // Plot the summary to a table
    plotSummary(columnz, rowz);
}

function plotTotalData()
{
    // Set title to all
    var title = 'St Paul all Districts';

    // Ensure values exist, otherwise set to 0
    var columnz = ['Metrics'];
    var rowz = [['Total'],['Searched'],['% Searched']];
    for (var key in countsByType.Searched)
    {
        columnz.push(key);
        if(!countsByType[key]) countsByType[key] = 0;
        if(!countsByType.Searched[key]) countsByType.Searched[key] = 0;
        rowz[0].push(countsByType[key]);
        rowz[1].push(countsByType.Searched[key]);
        if(countsByType[key] == 0)
            rowz[2].push(0.0);
        else
            rowz[2].push(100.0 * countsByType.Searched[key] / countsByType[key]);
    }

    // Create a list of gender and gender searched counts for this grid
    var pieValues = [countsByType.Male - countsByType.Searched.Male, countsByType.Female - countsByType.Searched.Female,
        countsByType.Searched.Male, countsByType.Searched.Female];

    // Create a list of searched counts by race for this grid
    var scatterValues = [countsByType.Searched.White, countsByType.Searched.Black, countsByType.Searched.Asian, 
        countsByType.Searched.Latino, countsByType.Searched.Other, countsByType.Searched.NativeAmerican];

     // Create a list of race counts for this grid
    var barValues = [countsByType.White, countsByType.Black, countsByType.Asian, countsByType.Latino, countsByType.Other, countsByType.NativeAmerican];

    // Plot the values
    plotData(pieValues, scatterValues, barValues, title);

    // Plot the summary to a table
    plotSummary(columnz, rowz);
}