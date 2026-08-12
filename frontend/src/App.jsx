import { useState, useEffect } from 'react'
import { weatherApi } from './services/api'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import LandingPage from './components/LandingPage'

function App() {
  const [hasEntered, setHasEntered] = useState(false)

  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    start_date: '',
    end_date: '',
  })

  const [loading, setLoading] = useState(false)
  const [savedFiles, setSavedFiles] = useState([])
  const [currentData, setCurrentData] = useState(null)
  const [isBrowsing, setIsBrowsing] = useState(false)
  const [activeFile, setActiveFile] = useState(null)

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
      setActiveFile(fileName)
      setIsBrowsing(false)
    } catch (error) {
      alert('Failed to load file content from S3')
    }
  }

  const handleClearData = () => {
    setCurrentData(null)
    setActiveFile(null)
  }

  const handleBrowseClick = () => {
    setIsBrowsing(true)
  }

  const handleCloseBrowser = () => {
    setIsBrowsing(false)
  }

  if (!hasEntered) {
    return <LandingPage onEnter={() => setHasEntered(true)} />
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <Sidebar
        formData={formData}
        setFormData={setFormData}
        handleFetchData={handleFetchData}
        loading={loading}
        savedFiles={savedFiles}
        handleFileClick={handleFileClick}
        activeFileName={activeFile}
        handleBrowseClick={handleBrowseClick}
      />
      <Dashboard
        currentData={currentData}
        isBrowsing={isBrowsing}
        savedFiles={savedFiles}
        handleFileClick={handleFileClick}
        handleCloseBrowser={handleCloseBrowser}
        handleClearData={handleClearData}
      />
    </div>
  )
}

export default App
