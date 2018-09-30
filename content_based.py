import pandas as pd
import numpy as np

def content_based(input_df):

# load movie classifications df from csv
    lookup_df = pd.read_csv("lookup.csv")
    print(input_df.head())
    print("---------------------")
    print(lookup_df.head())
# create list of classifications for the user rated movies
    movie_classif = []
    # df_filtered_ratings = pd.merge(lookup_df, input_df, on=["movieId"], how="inner")    
    

    for movie_id in input_df['movieId']:
        movie_classif.append(lookup_df.loc[lookup_df['movieId'] == movie_id]['class'].iloc[0])
    
    print("---------------------")

    print(movie_classif)

# add classifications to df
    working_df = input_df.assign(movie_classif=movie_classif)
    print(working_df.head())
# average the ratings for movies of same classification
    avg_ratings_df = working_df.groupby(['movie_classif'])['rating'].mean().to_frame().reset_index()
    print(avg_ratings_df.head())
# create personalized ratings for films based on input rating and weighted rating
    output_df = pd.DataFrame()
    for movie in avg_ratings_df['movie_classif']:
    
        lookup_sorted = lookup_df.loc[lookup_df['class'] == movie].sort_values(by='rating', ascending=False)
        print(type(lookup_sorted))
        personal_rating = lookup_sorted['rating'] * avg_ratings_df.loc[avg_ratings_df['movie_classif'] == movie]['rating'].iloc[0]
    
    personal_df = pd.DataFrame(
    {'movieId': lookup_sorted['movieId'],
     'personal_rating': np.interp(personal_rating, (0, 50), (0, +5))
    }).reset_index(drop=True)
    
    output_df = output_df.append(personal_df, ignore_index=True)


    return output_df.sort_values(by='personal_rating', ascending=False)

