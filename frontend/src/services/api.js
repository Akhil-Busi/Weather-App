import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const weatherApi = {
  storeWeatherData: async (payload) => {
    const response = await api.post('/store-weather-data', payload)
    return response.data
  },

  listWeatherFiles: async () => {
    const response = await api.get('/list-weather-files')
    return response.data.files
  },

  getWeatherFileContent: async (fileName) => {
    const response = await api.get(`/weather-file-content/${encodeURIComponent(fileName)}`)
    return response.data
  },
}

export default api
