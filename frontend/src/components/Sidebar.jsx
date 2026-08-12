import { Cloud, Download, Loader2, FileJson, FolderOpen } from 'lucide-react'

export default function Sidebar({ formData, setFormData, handleFetchData, loading, savedFiles, handleFileClick, activeFileName, handleBrowseClick }) {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const parseFilenameForDates = (filename) => {
    try {
      const parts = filename.split('_')
      if (parts.length >= 5) {
        const startDate = parts[3]
        const endDate = parts[4]

        const start = new Date(startDate)
        const end = new Date(endDate)
        const diffTime = Math.abs(end - start)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

        return `${diffDays} days · ${startDate} → ${endDate}`
      }
    } catch (e) {
      // fallback if filename structure changes
    }
    return 'Stored Archive'
  }

  return (
    <div className="w-full md:w-80 bg-[#f8fafc] md:border-r border-slate-200 flex flex-col p-4 md:p-6 gap-6 md:h-screen md:sticky md:top-0 overflow-y-auto font-sans shadow-sm md:shadow-none z-10">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-[#e6f3f5] text-[#008394] rounded-full">
          <Cloud size={24} />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-800 leading-tight">Historic Weather</h1>
          <p className="text-xs text-slate-500 mt-1">Fine tune your query, Fetch once, Store as a file AND Visualize</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-700 mb-4">Query parameters</h2>

        <form onSubmit={handleFetchData} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Latitude</label>
              <input required type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-700 focus:border-[#008394] focus:ring-1 focus:ring-[#008394] outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Longitude</label>
              <input required type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-700 focus:border-[#008394] focus:ring-1 focus:ring-[#008394] outline-none transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Start date</label>
            <input required type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-700 focus:border-[#008394] focus:ring-1 focus:ring-[#008394] outline-none transition-all" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">End date</label>
            <input required type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-700 focus:border-[#008394] focus:ring-1 focus:ring-[#008394] outline-none transition-all" />
          </div>

          <div className="pt-2 space-y-2">
            <button 
              disabled={loading} 
              type="submit" 
              className="w-full bg-[#008394] hover:bg-[#006f7e] text-white rounded-lg p-2.5 text-sm font-medium flex justify-center items-center gap-2 transition-colors disabled:opacity-70"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {loading ? 'Fetching...' : 'Fetch & store data'}
            </button>

            <button 
              type="button"
              onClick={handleBrowseClick}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg p-2.5 text-sm font-medium flex justify-center items-center gap-2 transition-colors"
            >
              <FolderOpen size={16} className="text-slate-500" /> Browse stored files
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex-1 flex flex-col min-h-[250px]">
        <h2 className="text-sm font-bold text-slate-700 mb-4">Stored files</h2>

        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {savedFiles
            ?.filter(file => file && file.name && file.name.endsWith('.json'))
            .map((file, idx) => {
              const isActive = activeFileName === file.name
              const sizeKB = (file.size / 1024).toFixed(1)
              const dateFormatted = new Date(file.created_at).toLocaleDateString()

              return (
                <button 
                  key={idx} 
                  onClick={() => handleFileClick(file.name)}
                  className={`w-full text-left rounded-xl p-3 transition-all group flex gap-3 items-start border ${
                    isActive
                      ? 'bg-[#f0f9fa] border-[#008394] shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <FileJson size={16} className={`mt-0.5 shrink-0 ${isActive ? 'text-[#008394]' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <div className="overflow-hidden w-full">
                    <p className={`text-xs font-medium truncate ${isActive ? 'text-[#008394]' : 'text-slate-700'}`}>
                      {file.name}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <p className={`text-[10px] ${isActive ? 'text-[#008394]/70' : 'text-slate-500'}`}>
                        {dateFormatted}
                      </p>
                      <p className={`text-[10px] font-mono ${isActive ? 'text-[#008394]/70' : 'text-slate-400'}`}>
                        {sizeKB} KB
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
        </div>
      </div>
    </div>
  )
}
