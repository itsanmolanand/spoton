#!/usr/bin/env python3

# By Anmol Anand

import pandas as pd
import joblib
from sklearn.neighbors import NearestNeighbors

data = pd.read_csv('data/spotify_audio_features.csv')
X = data.drop(['Name', 'ArtistName', 'Track ID', 'Album', 'Release Date'], axis=1)

model = NearestNeighbors(n_neighbors=20, algorithm='auto')
model = model.fit(X)
joblib.dump(model, 'data/n_neighbors20.joblib')