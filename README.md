# SpotOn
Generates 10 song recommendations for a given song through the use of the nearest neighbors algortihm.

To run this program, you first need to run the file service.py and then you can run the front end file App.tsx.

## Developing the Model
To make the model, the first step was to collect the data. The data was collected through the Spotify API parsing through around 5000+ songs from various playlists. In addition from using songs from the most popular generes, 23 playlists were used to get the most popular songs from each year since 2000. 

For each song, I pulled the song's artist, title, year it was released, and the various spotify audio features. You can find what each of the spotify audio features mean here: <https://developer.spotify.com/documentation/web-api/reference/get-audio-features>.

From these audio features, I used a correlation map to figure out which features correlated the most to each other, and then removed any features that would not aid the model. This means that the songs that are being recommended to the user are mostly based on the way that the song sounds, not the content on the songs. Therefore the songs might be from genres that are not the same as the given song, but when you listen to them, you can hear the similarities.

## Generating the Model

In order to run the program, you will first need to run the file build_model.py to create the joblib model based on the data provided in spotify_audio_features.csv. After the joblib file is created, this file will be referenced in service.py. This way the model does not have to be created every single time the user inputs a new song.

First, install the dependencies:

`pip3 install -r requirements.txt`

Then, run:

`python3 build_model.py`


## Building the Frontend

Once the model was completed and I was getting songs that seemed like reasonable recommendations, I decided I wanted to learn React to make a website for the user to easily interpret the songs.

The webpage has two options for the user to get recommendations, the first being to input the song themselves (title and artist inputed exactly as they are shown on Spotify) or to pick a song from the list of popular songs. The list will refresh with 5 random songs from the list provided whenever the user submits a valid or invalid song.

## To run this program, you can use something similar to below:

### You can get the Spotify credentials by signing up for their developer program
- export SPOTIFY_CLIENT_ID="XXXXXXXXXXXXXXXXXXXXXXXXXXX"
- export SPOTIFY_CLIENT_SECRET="XXXXXXXXXXXXXXXXXXXXXXXXX"

`uvicorn service:app --reload`
