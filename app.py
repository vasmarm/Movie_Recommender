import os


import pymysql
pymysql.install_as_MySQLdb()
import mysql.connector 
import sqlite3
import pandas as pd
import datetime
import calendar
import time

from flask import Flask, jsonify, render_template,g
from mysql.connector import errorcode
from cf_train_predict import predict_cf, train_cf
from content_based import content_based

app = Flask(__name__)

#################################################
# Database Setup
#################################################
DATABASE = 'temp-movie-machine.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

#################################################
# Routes
#################################################

@app.route("/data")
def dataFetch():
    data = []
    """Return a list of sample names."""
    # JWS_URL = 'mysql://frkgd2yep9avgh5i:v9i0jxcvk31usd96@sp6xl8zoyvbumaa2.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/da1d21r7cqb5yeq2'	
    
    c = get_db().cursor()

    c.execute("""SELECT DISTINCT(userId) FROM ratings where customUser = 'TRUE'""")
    for row in c:
        d = {
            'userId': row[0]
        }
        data.append(d)
    c.close()
    return jsonify(data)

@app.route("/")
def renderData():
    return render_template("index.html")

@app.route("/activity")
def renderActivity():
    return render_template("activity.html")

@app.route("/activityData")
def renderActivityData():
    data = []
    """Return a list most popular movies."""
    # JWS_URL = 'mysql://frkgd2yep9avgh5i:v9i0jxcvk31usd96@sp6xl8zoyvbumaa2.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/da1d21r7cqb5yeq2'	

    c = get_db().cursor()

    c.execute("""Select original_title, weighted_rating, popularity from movie_metadata order by weighted_rating desc LIMIT 10""")
    for row in c:
        d = {
            'title': row[0],
            'weighted_rating': row[1],
            'popularity': row[2]
        }
        data.append(d)
    c.close()
    return jsonify(data)

@app.route("/ratingsUserData&userId=<currentUser>")
def ratingsUserData(currentUser):
    data = []
    #"""Return a list of sample names."""
    # JWS_URL = 'mysql://frkgd2yep9avgh5i:v9i0jxcvk31usd96@sp6xl8zoyvbumaa2.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/da1d21r7cqb5yeq2'	
    c = get_db().cursor()

    c.execute("""SELECT movieId, rating FROM ratings_main where userId = ?""", [currentUser])
    for row in c:
        d = {
            'movieId': int(row[0]),
            'rating': float(row[1])
        }
        data.append(d)
    
    df_input_content_based = pd.DataFrame(data)
    df_predict = predict_cf(currentUser)
    df_predict.rename(columns={'movieID':'movieId'}, inplace=True)

    print("$$$$$$$$$$$$")
    print(df_predict)
    df_content_based_predict = content_based(df_input_content_based)
    print("*************")
    print(df_content_based_predict)

    df_final_predict = pd.merge(df_predict, df_content_based_predict, on="movieId", how="inner")

    json_final_predicted_data = df_final_predict.to_json(orient='values')
    print(json_final_predicted_data)
    # c.close()
    return json_final_predicted_data
    # return jsonify(data)

@app.route("/insertRatings&userId=<currentUser>&movieId=<movieId>&movieRating=<movieRating>")
def insertRatings(currentUser,movieId, movieRating):
    data = []
    currentTime = calendar.timegm(time.gmtime())
    print(currentTime)
    print(currentUser)
    print(movieId)
    print(movieRating)
    c = get_db().cursor()

    """Return a list of sample names."""
    # JWS_URL = 'mysql://frkgd2yep9avgh5i:v9i0jxcvk31usd96@sp6xl8zoyvbumaa2.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/da1d21r7cqb5yeq2'	

    c.execute("""INSERT INTO rating_main VALUES (?,?,?,?,?)""", ["Vinnie", "1", "4", currentTime, "TRUE"]) 
    e = get_db().commit()
    c.execute("""SELECT * FROM rating_main""")
    for row in c:
        d = {
            'userId': row[0],
            'movieId': row[1],
            'movieRating': row[2],
            'timestamp': row[3],
            'customerUser': row[4]
        }
        data.append(d)
    c.close()
    print(len(data))
    print(type(pd.DataFrame(data)))
    print(pd.DataFrame(data).head())
    df_train = train_cf(pd.DataFrame(data))
    print(df_train)
    return jsonify(df_train)


if __name__ == '__main__':
    app.run()