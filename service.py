#!/usr/bin/env python3

# By Anmol Anand

from typing import Union
from fastapi import FastAPI
import pandas as pd
import joblib
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import json
import requests
import time
import joblib
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/songs")
def read_root(track, artist):
    songs = []
    songs_accessed = []
    counter = 1
    data = pd.read_csv('./data/spotify_audio_features.csv')
    X = data.drop(['Name', 'ArtistName', 'Track ID', 'Album', 'Release Date'], axis=1) 
    
    
    client_id = os.environ.get('SPOTIFY_CLIENT_ID')
    client_secret = os.environ.get('SPOTIFY_CLIENT_SECRET')

    client_credentials_manager = SpotifyClientCredentials(client_id=client_id, client_secret=client_secret)
    SPOTIFY_REDIRECT = 'http://localhost:8888/callback'
    BASE_URL = 'https://api.spotify.com/v1/'
    AUTH_URL = 'https://accounts.spotify.com/api/token'

    # POST
    auth_response = requests.post(AUTH_URL, {
        'grant_type': 'client_credentials',
        'client_id': client_id,
        'client_secret': client_secret,
    })

    # convert the response to JSON
    auth_response_data = auth_response.json()

    # save the access token
    access_token = auth_response_data['access_token']
    headers = {
        'Authorization': 'Bearer {token}'.format(token=access_token)
    }

    def remove(string):
        return string.replace(" ", "")

    def get_artist_id(df, artist_name):
        artist_df = df[df['ArtistName'] == artist_name]
        if artist_df.empty:
            return 0
        else:
            return artist_df['ArtistID'].iloc[0]

    # Get the spotify data of the song that the user submitted
    sp = spotipy.Spotify(auth=access_token)
    spdata = sp.search(q='artist:' + artist + ' track:' + track, type='track')

    track = track.strip()
    artist = artist.strip()

    # Check to see if recieved song from Spotify is the same song that the user inputted
    if len(spdata['tracks']['items']) == 0:
         return {"track": track, "artist": artist, "songs": ["error"]}
    
    if spdata['tracks']['items'][0]['name'].lower() != track.lower():
        if spdata['tracks']['items'][0]['album']['artists'][0]['name'].lower() == None:
            return {"track": track, "artist": artist, "songs": ["error"]}
        elif spdata['tracks']['items'][0]['album']['artists'][0]['name'].lower() != artist.lower():
            return {"track": track, "artist": artist, "songs": ["error"]}
        return {"track": track, "artist": artist, "songs": ["error"]}
        
    if spdata['tracks']['items'][0]['album']['artists'][0]['name'].lower() == None:
        return {"track": track, "artist": artist, "songs": ["error"]}
    elif spdata['tracks']['items'][0]['album']['artists'][0]['name'].lower() != artist.lower():
        return {"track": track, "artist": artist, "songs": ["error"]}
        
    trackId = spdata['tracks']['items'][0]['id']
    

    artist_name = get_artist_id(data, artist)

    feature_dict = {}
    song = trackId

    feature_dict[song] = {}

    r = requests.get(BASE_URL + 'tracks/' + song, headers=headers)
    time.sleep(0.5)
    r = r.json()

    feature_dict[song]['Popularity'] = r['popularity']

    s = requests.get(BASE_URL + 'audio-features/' + song, headers=headers)
    s = s.json()
    feature_dict[song]['Acousticness'] = s['acousticness']
    feature_dict[song]['Danceability'] = s['danceability']
    feature_dict[song]['Duration (ms)'] = s['duration_ms']
    feature_dict[song]['Energy'] = s['energy']
    feature_dict[song]['Instrumentalness'] = s['instrumentalness']
    feature_dict[song]['Key'] = s['key']
    feature_dict[song]['Liveness'] = s['liveness']
    feature_dict[song]['Loudness'] = s['loudness']
    feature_dict[song]['Mode'] = s['mode']
    feature_dict[song]['Speechiness'] = s['speechiness']
    feature_dict[song]['Tempo'] = s['tempo']
    feature_dict[song]['Valence'] = s['valence']

    df_features = pd.DataFrame.from_dict(feature_dict, orient='index')
    df_features.reset_index(inplace=True, drop=True)
    df_features.insert(1, 'ArtistID', artist_name)

    n_neighbors20 = joblib.load("data/n_neighbors20.joblib")
    distances, indices = n_neighbors20.kneighbors(df_features)

    track = remove(track)
    artist = remove(artist)

    given_song = track + "_" + artist


    for i in range(len(distances.flatten())):
        cur_name = remove(data['Name'].iloc[indices.flatten()[i]])
        cur_artist = remove(data['ArtistName'].iloc[indices.flatten()[i]])

        cur_song = (cur_name + '_' + cur_artist).lower()

        print(cur_song)
        if data['Track ID'].iloc[indices.flatten()[i]] == trackId:
            continue
        if cur_song in songs_accessed:
            continue
        if given_song.lower() == cur_song:
            continue

        songs_accessed.append(cur_song)
        songs.append(data['Track ID'].iloc[indices.flatten()[i]])
        if counter == 10:
            break
        counter += 1
    return {"track": track, "artist": artist, "songs": songs}
