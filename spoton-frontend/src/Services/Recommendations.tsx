import axios from 'axios'

export async function fetchSongs(track: string, artist: string) {
    return await axios.get(`http://localhost:8000/api/songs?track=${encodeURIComponent(track)}&artist=${encodeURIComponent(artist)}`)
    .then((response) => {
      return response.data["songs"]
    })
    .catch((error) => {
      console.log(error)
    })
}