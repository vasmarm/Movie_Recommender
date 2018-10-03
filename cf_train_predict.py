# Collaborative Filtering

import numpy as np
import pandas as pd
import random
import pickle
from surprise import Reader, Dataset, SVD, dump

my_seed = 0
random.seed(my_seed)
np.random.seed(my_seed)

# Load the raw data with pandas
ratings_df = pd.read_csv("Data/ratings_small.csv")

# Train the model using the tuned SVD parameters whenever new data of user rating feed in
def train_cf(df):

    '''
    Input: 
        df - pandas dataframe with updated ratings from the user interface, same format as the ratings_small.csv
    Output:
        algo - SVD model retrained using the optimized hyperparameters
    '''

    # Load tuned SVD parameters
    with open('cf_params.pickle', 'rb') as handle:
        best_params = pickle.load(handle)
    
    # Load the full dataset from dataframe
    reader = Reader()
    data = Dataset.load_from_df(df[['userId', 'movieId', 'rating']], reader)

    # Train SVD model using tuned parameters
    algo = SVD(
        n_epochs = best_params['n_epochs'],
        lr_all = best_params['lr_all'],
        reg_all = best_params['reg_all'],
    )
    trainset = data.build_full_trainset()
    algo.fit(trainset)

    # Save retrained model
    dump.dump('cf_model', algo=algo)

    return algo


# Predict user-specific ratings based on up-to-date SVD model
def predict_cf(user_id, df=ratings_df):

    '''
    Input:
        user_id - user id to provide movie recommendations to
        df - pandas dataframe of movie ratings to extrapolate the unique movie id's, default to using data from ratings_small.csv
    Output:
        df_pred - pandas dataframe of predicted movie ratings of the given user id for all unique movie id's
    '''

    # Load trained SVD model
    _, algo = dump.load('cf_model')

    # Get the unique movie ids from the ratings data
    movie_ids = list(np.sort(df['movieId'].unique()))
    df_pred = pd.DataFrame({'movieID': movie_ids})

    # Predict user-specific ratings for all the movie ids in the ratings data
    df_pred['rating_cf_pred'] = df_pred['movieID'].apply(lambda x: algo.predict(user_id, x).est)

    # Load reference movies metadata
    df_meta = pd.read_csv("cf_meta.csv.gz")

    # Merge predictions with metadata
    df_pred = df_pred.merge(df_meta, how='inner', left_on='movieID', right_on='id')

    # Sort by predicted rating
    df_pred = df_pred.sort_values(by=['rating_cf_pred'], ascending=False)

    # Drop duplicated movie id column
    df_pred = df_pred.drop(columns=['id'])

    # Fill NaN with ''
    df_pred = df_pred.fillna('')
    
    return df_pred
