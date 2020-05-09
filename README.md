# TRAFFIC-STOPS-IN-SAINT-PAUL-MINNESOTA

This project involves data visualization of  traffic stop incident within the city of Saint Paul, Minnesota collected from 1/1/2017 to 12/31/2018. The original data set was collected by police officers and shared through a Socrata powered platform. For more information on the original raw data, please refer to https://information.stpaul.gov/Public-Safety/Traffic-Stop-Dataset/kkd6-vvns" 

The data is stored in a SQLite database. The visualization presents several interactive graphics to help the user navigate through the data set. The graphics leverage Chartist, Leaflet, MapBox, and Plotly javascript libraries. Bootstrap and Bootswatch libraries were used to format the website.

### Contributors: Beryl Kaczmarczik, Farshad Esnaashari, Katherine Rootes, Matt Pollari

## How to Use
This documentation shows the steps needed to run the project website on your local
computer.  

Prequisites:
 A. SQLite installed on your local computer (SQLite is used for the database)
 B. You have obtained an API_Key from the Mapbox (API Key is needed for Leaflet).

Steps:
1. Clone the repository on your desktop
2. create a config.js javascript file in the static folder and include the following line :  const API_KEY = "<include the API key that you'd obtained for Leaflet">

3. Navigate to the folder that contains insert_data.py and launch GitBach (Windows) or Terminal (Mac).
4. type source activate PythonData
5. type python insert_data.py (this will create a database and inserts the data from the data folder).  Note: be sure that you see sample data is printed on your terminal session  
6. type export FLASK_APP=app.py
7. Type flask run 
Observe that FLASK server starts and tells you which port it's running
8. Open your Chrome browser and enter this address:  http://127.0.0.1.5000.

You should see the project webpage with the title: St. Paul 99 - Project II

