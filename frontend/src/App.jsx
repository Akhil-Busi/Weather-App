import { useState, useEffect } from 'react'
import { weatherApi } from './services/api'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'

function App() {
  const [formData, setFormData] = useState({
    latitude: 51.5,
    longitude: -0.1,
    start_date: '2024-01-01',
    end_date: '2024-01-10',
  })

  const [loading, setLoading] = useState(false)
  const [savedFiles, setSavedFiles] = useState([])
  const [currentData, setCurrentData] = useState(null)
  const [isBrowsing, setIsBrowsing] = useState(true)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const response = await weatherApi.listWeatherFiles()
      const fileArray = response.files || response || []
      setSavedFiles(fileArray)
    } catch (error) {
      console.error('Failed to load files:', error)
    }
  }

  const handleFetchData = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await weatherApi.storeWeatherData(formData)
      await loadFiles()
      await handleFileClick(response.file)
    } catch (error) {
      alert('Error: ' + (error.response?.data?.detail?.[0]?.msg || 'Failed to fetch data'))
    } finally {
      setLoading(false)
    }
  }

  const handleFileClick = async (fileName) => {
    try {
      const data = await weatherApi.getWeatherFileContent(fileName)
      setCurrentData(data)
      setIsBrowsing(false)
    } catch (error) {
      alert('Failed to load file content from S3')
    }
  }

  const handleBrowseClick = () => {
    setIsBrowsing(true)
  }

  const handleCloseBrowser = () => {
    setIsBrowsing(false)
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <Sidebar
        formData={formData}
        setFormData={setFormData}
        handleFetchData={handleFetchData}
        loading={loading}
        savedFiles={savedFiles}
        handleFileClick={handleFileClick}
        activeFileName={currentData?.file_name || currentData?.name || null}
        handleBrowseClick={handleBrowseClick}
      />
      <Dashboard
        currentData={currentData}
        isBrowsing={isBrowsing}
        savedFiles={savedFiles}
        handleFileClick={handleFileClick}
        handleCloseBrowser={handleCloseBrowser}
      />
    </div>
  )
}

export default App
