
# import dependencies
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, render_template, jsonify


#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///db/traffic_stops.sqlite")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save reference to the table
Stops = Base.classes.traffic_stops

#################################################
# Flask server Setup
#################################################
app = Flask(__name__)
# app.confg below was included to turn off caching in development.
# it is no longer needed.
# app.config['SEND_FILE_MAX_AGE_DEFAULT'] =0

#################################################
# Create Flask server Routes
#################################################
# # html pages
@app.route("/")
def IndexRoute():
#     """This function runs when the browser loads the index route"""
    
    webpage = render_template('index.html')
    return webpage

@app.route('/graphs')
def graphs():
    webpage=render_template('graphs.html')
    return webpage

@app.route('/map')
def map():
    webpage=render_template('map.html')
    return webpage
    
#  Create data routes
@app.route("/trafficdata")
def trafficdata():
    # Create a session (link) from Python to the sqlite DB
    session = Session(engine)
    # Query all traffic_stops
    results = session.query(Stops.Year,Stops.Date, Stops.Race, Stops.Gender, Stops.DriverSearched, Stops.VehicleSearched, Stops.Citation, Stops.Reason, Stops.Grid, Stops.Location).all()
    session.close()

    #create a dictionary from the raw data
    stops = []
    for Year,Date,Race, Gender, DriverSearched, VehicleSearched, Citation, Reason, Grid, Location in results:
        stops_dict ={}
        stops_dict["Year"] = Year
        stops_dict["Date"] = Date
        stops_dict["Gender"] = Gender
        stops_dict["Race"] = Race
        stops_dict["DriverSearched"] = DriverSearched
        stops_dict["VehicleSearched"] = VehicleSearched
        stops_dict["Citation"] = Citation
        stops_dict["Reason"] = Reason
        stops_dict["Grid"] = Grid
        stops_dict["Location"]= Location
        stops.append(stops_dict);  
    #stops = list(np.ravel(results))
    return jsonify(stops)

if __name__ == '__main__':
    app.run(debug=True)
