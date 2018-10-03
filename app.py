#################################################
# All Imports
#################################################
import os
import pymysql
pymysql.install_as_MySQLdb()
import mysql.connector 
import sqlite3
import pandas as pd
import datetime
import calendar
import time
import json as json

from flask import Flask, jsonify, render_template,g
from mysql.connector import errorcode
from cf_train_predict import predict_cf, train_cf
from content_based import content_based

#################################################
# Setting Flask
#################################################
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
# All Routes
#################################################

#################################################
# /data Route to fetch list of users
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

#################################################
# Default Route (just render to index.html)
#################################################
@app.route("/")
def renderData():
    return render_template("index.html")

#################################################
# /activity Route (just render to index.html)
#################################################
@app.route("/activity")
def renderActivity():
    return render_template("activity.html")

#################################################
# /activityData Route (Selects data from 
# movie_metadata to show most loved movies 
# in the table)
#################################################
@app.route("/activityData")
def renderActivityData():
    data = []
    """Return a list most popular movies."""
    # JWS_URL = 'mysql://frkgd2yep9avgh5i:v9i0jxcvk31usd96@sp6xl8zoyvbumaa2.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/da1d21r7cqb5yeq2'	

    c = get_db().cursor()

    c.execute("""Select original_title, weighted_rating, popularity, poster_path, original_language, release_date, id from movie_metadata order by weighted_rating desc LIMIT 10""")
    for row in c:
        d = {
            'title': row[0],
            'weighted_rating': row[1],
            'popularity': row[2],
            'poster_path': row[3],
            'original_language': row[4],
            'release_date': row[5],
            'movieId': row[6]
        }
        data.append(d)
    c.close()
    return jsonify(data)

#################################################
# ratingsUserData Route 
# selects movieId, rating based upon userIdfrom 
# ratings table to feed them to content based modal
#################################################
@app.route("/ratingsUserData&userId=<currentUser>")
def ratingsUserData(currentUser):
    data = []
    #"""Return a list of sample names."""
    # JWS_URL = 'mysql://frkgd2yep9avgh5i:v9i0jxcvk31usd96@sp6xl8zoyvbumaa2.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/da1d21r7cqb5yeq2'	
    c = get_db().cursor()

    c.execute("""SELECT movieId, rating FROM ratings where userId = ?""", [currentUser])
    for row in c:
        d = {
            'movieId': int(row[0]),
            'rating': float(row[1])
        }
        data.append(d)
    df_input_content_based = pd.DataFrame(data)
    # print(df_input_content_based)
    
    df_predict = predict_cf(currentUser)
    df_predict.rename(columns={'movieID':'movieId'}, inplace=True)
    df_predict['movieId'] = df_predict["movieId"].astype('int')
    # print(len(df_predict))

    df_content_based_predict = content_based(df_input_content_based)
    df_content_based_predict['movieId'] = df_content_based_predict["movieId"].astype('int')
    # print(len(df_content_based_predict))
    
    df_final_predict = pd.merge(df_predict, df_content_based_predict, on="movieId", how="outer")
    # print(len(df_final_predict))

    ##########################################
    # Deal with duplicate columns after merge
    # Load reference movies metadata
    ##########################################
    df_meta = pd.read_csv("cf_meta.csv.gz")

    # Drop duplicated columns
    df_final_predict = df_final_predict.drop(columns=['title_x', 'title_y', 
                                                    'original_language_x', 'original_language_y', 
                                                    'release_date_x', 'release_date_y', 
                                                    'poster_path_full_x', 'poster_path_full_y'])

    # Merge predictions with metadata
    df_final_predict = df_final_predict.merge(df_meta, how='inner', left_on='movieId', right_on='id')

    # Drop duplicate movie id column
    df_final_predict = df_final_predict.drop(columns=['id'])

    # Fill NaN of selected columns (language, release date, poster path) with ''
    df_final_predict[['original_language', 'release_date', 'poster_path_full']] = df_final_predict[['original_language', 'release_date', 'poster_path_full']].fillna(value='')
    ############################

    for movieId in df_input_content_based['movieId']:
        df_final_predict.drop(df_final_predict[df_final_predict['movieId'] == movieId].index, inplace=True)

        
    # print(len(df_final_predict))
    df_final_predict['recommendedRating'] = df_final_predict[['rating_cf_pred','weighted_rating']].mean(axis=1)
    
    df_final_predict = df_final_predict.sort_values(by='recommendedRating', ascending = False).head(100)
   
   
    json_final_predicted_data = df_final_predict.to_json(orient='records')
    return (json_final_predicted_data)


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

    c.execute("""INSERT INTO ratings VALUES (?,?,?,?,?)""", [currentUser, movieId, movieRating,currentTime, "TRUE"]) 
    e = get_db().commit()

    c.execute("""SELECT * FROM ratings""")
    for row in c:
        d = {
            'userId': row[0],
            'movieId': row[1],
            'rating': row[2],
            'timestamp': row[3],
            'customerUser': row[4]
        }
        data.append(d)
    c.close()
    # print(len(data))
    # print(type(pd.DataFrame(data)))
    # print(pd.DataFrame(data).head())
    df_train = train_cf(pd.DataFrame(data))
    # print(df_train)
    # print("@@@@@@@@@@@@@@@@@@")
    return json.dumps({'status': 1}, sort_keys=True, indent=4 * ' ')


if __name__ == '__main__':
    app.run()