import { useState, useEffect } from 'react'
import { weatherApi } from './services/api'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import LandingPage from './components/LandingPage'

function App() {
  const [hasEntered, setHasEntered] = useState(false)
  const [error, setError] = useState(null)

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
    setError(null)
    setLoading(true)
    try {
      const response = await weatherApi.storeWeatherData(formData)
      await loadFiles()
      await handleFileClick(response.file)
    } catch (error) {
      // Handle FastAPI validation errors
      if (error.response?.data?.detail) {
        const details = error.response.data.detail
        if (Array.isArray(details)) {
          const formattedMsg = details.map(err => err.msg).join(', ')
          setError(formattedMsg)
        } else if (typeof details === 'string') {
          setError(details)
        } else {
          setError('Failed to fetch data')
        }
      } else {
        setError(error.message || 'Failed to fetch data')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFileClick = async (fileName) => {
    try {
      setError(null)
      const data = await weatherApi.getWeatherFileContent(fileName)
      setCurrentData(data)
      setActiveFile(fileName)
      setIsBrowsing(false)
    } catch (error) {
      setError('Failed to load file content from S3')
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
      {error && (
        <div className="fixed top-5 right-5 z-50 max-w-sm bg-zinc-900 border border-red-500/60 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-3 animate-fade-in">
          <div className="text-sm">
            <span className="font-semibold text-red-400 block mb-0.5">Error</span>
            <span className="text-zinc-300">{error}</span>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="text-zinc-400 hover:text-white p-1 flex-shrink-0"
          >
            ✕
          </button>
        </div>
      )}
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
