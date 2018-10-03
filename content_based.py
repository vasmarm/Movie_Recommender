import pandas as pd
import numpy as np

def content_based(input_df):

    # load movie classifications df from csv
    lookup_df = pd.read_csv("lookup.csv", index_col = 0)

    # Remove duplicate movie entries
    lookup_df = lookup_df.drop_duplicates(subset=['movieId'])

    # create list of classifications for the user rated movies
    movie_classif = []
    movie_languages = []
    for movie_id in input_df['movieId']:
        movie_classif.append(lookup_df.loc[lookup_df['movieId'] == movie_id]['class'].iloc[0])
        movie_languages.append(lookup_df.loc[lookup_df['movieId'] == movie_id]['original_language'].iloc[0])

        
    lang_list = list(set(movie_languages))


    def assign_weight(lang):
        if lang in lang_list:
            weight = 1
        else:
            weight = 0.9

        return weight

    # add classifications to df
    working_df = input_df.assign(movie_classif=movie_classif)

    # average the ratings for movies of same classification
    avg_ratings_df = working_df.groupby(['movie_classif'])['rating'].mean().to_frame().reset_index()

    # create personalized ratings for films based on input rating and weighted rating
    output_df = pd.DataFrame()
    for movie in avg_ratings_df['movie_classif']:

        lookup_sorted = lookup_df.loc[lookup_df['class'] == movie].sort_values(by='rating', ascending=False)

        personal_rating = lookup_sorted['rating'] * avg_ratings_df.loc[avg_ratings_df['movie_classif'] == movie]['rating'].iloc[0]

        personal_df = pd.DataFrame(
            {'movieId': lookup_sorted['movieId'],
                'classification': lookup_sorted['class'],
                'personal_rating': np.interp(personal_rating, (0, 50), (0, +5)),
                'title': lookup_sorted['title'],
                'original_language': lookup_sorted['original_language'],
                'poster_path_full': lookup_sorted['poster_path_full'],
                'release_date': lookup_sorted['release_date']
            }).reset_index(drop=True)

        output_df = output_df.append(personal_df, ignore_index=True)


    output_df['weighted_rating'] = output_df['original_language'].apply(assign_weight) * output_df['personal_rating']
    return output_df.sort_values(by='weighted_rating', ascending=False)