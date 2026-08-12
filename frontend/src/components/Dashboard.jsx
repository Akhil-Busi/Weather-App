import { useState } from 'react'
import { CloudRain, FolderOpen, FileJson, MapPin, Calendar, X } from 'lucide-react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'

export default function Dashboard({ currentData, isBrowsing, savedFiles, handleFileClick, handleCloseBrowser }) {
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const parseFilename = (filename) => {
    try {
      const parts = filename.split('_')
      if (parts.length >= 5) {
        return {
          lat: parts[1],
          lon: parts[2],
          start: parts[3],
          end: parts[4],
        }
      }
    } catch (e) {}
    return null
  }

  if (isBrowsing) {
    const validFiles = savedFiles?.filter((f) => f?.name?.endsWith('.json')) || []

    return (
      <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white border border-slate-200 text-[#008394] rounded-xl shadow-sm">
                <FolderOpen size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Stored Archives</h2>
                <p className="text-sm text-slate-500">Select an offline file from your S3 bucket to visualize.</p>
              </div>
            </div>

            <button
              onClick={handleCloseBrowser}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2"
              title="Close Browser"
            >
              <span className="text-sm font-medium hidden sm:block">Close</span>
              <X size={20} />
            </button>
          </div>

          {validFiles.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <FileJson size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600 font-medium">Your archive is empty.</p>
              <p className="text-sm text-slate-400 mt-1">Use the sidebar to fetch and store new weather data.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {validFiles.map((file, idx) => {
                const meta = parseFilename(file.name)
                return (
                  <button
                    key={idx}
                    onClick={() => handleFileClick(file.name)}
                    className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-[#008394] hover:shadow-md transition-all text-left flex flex-col h-full group"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-[#e6f3f5] group-hover:text-[#008394] transition-colors">
                        <FileJson size={20} />
                      </div>
                      <p className="text-xs font-semibold text-slate-700 truncate pt-1 flex-1 leading-snug" title={file.name}>
                        {file.name}
                      </p>
                    </div>

                    {meta && (
                      <div className="mt-auto space-y-2 border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <MapPin size={14} className="text-slate-400" />
                          <span>{meta.lat}°, {meta.lon}°</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar size={14} className="text-slate-400" />
                          <span>{meta.start} to {meta.end}</span>
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!currentData) {
    return (
      <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full">
          <CloudRain size={48} className="mx-auto mb-4 text-slate-300" />
          <h2 className="text-xl font-semibold text-slate-700">No Data Loaded</h2>
          <p className="mt-2 text-sm text-slate-500">
            Select a file from your stored archives on the left to visualize the offline data.
          </p>
        </div>
      </div>
    )
  }

  const daily = currentData?.daily || {}
  const timeArray = daily.time || []

  const chartData = timeArray.map((date, index) => ({
    date: date,
    maxTemp: daily.temperature_2m_max?.[index] ?? 0,
    minTemp: daily.temperature_2m_min?.[index] ?? 0,
    precip: daily.precipitation_sum?.[index] ?? 0,
    wind: daily.windspeed_10m_max?.[index] ?? 'N/A',
  }))

  const totalDays = timeArray.length
  const startDate = timeArray[0]
  const endDate = timeArray[timeArray.length - 1]

  const totalPages = Math.ceil(totalDays / rowsPerPage) || 1
  const indexOfLastRow = currentPage * rowsPerPage
  const indexOfFirstRow = indexOfLastRow - rowsPerPage
  const currentRows = chartData.slice(indexOfFirstRow, indexOfLastRow)

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage)
  }

  const handleRowsChange = (rows) => {
    setRowsPerPage(rows)
    setCurrentPage(1)
  }

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#f8fafc] text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Coordinates</p>
            <p className="text-lg font-medium text-slate-700">{currentData.latitude}, {currentData.longitude}</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Range</p>
            <p className="text-sm font-medium text-slate-700 mt-1">{startDate} → {endDate}</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Days</p>
            <p className="text-lg font-medium text-slate-700">{totalDays}</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Timezone</p>
            <p className="text-lg font-medium text-slate-700">{currentData.timezone || 'GMT'}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-6">Daily max / min temperature</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} tickMargin={10} tickFormatter={(tick) => tick.slice(5)} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Area type="monotone" dataKey="maxTemp" name="Max temp (°C)" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorMax)" activeDot={{ r: 6 }} />
                <Area type="monotone" dataKey="minTemp" name="Min temp (°C)" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorMin)" activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700">Daily records</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Date</th>
                  <th className="px-5 py-3 text-right font-medium">Max °C</th>
                  <th className="px-5 py-3 text-right font-medium">Min °C</th>
                  <th className="px-5 py-3 text-right font-medium">Precip. mm</th>
                  <th className="px-5 py-3 text-right font-medium">Wind km/h</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap text-left">{row.date}</td>
                    <td className="px-5 py-3 text-right">{row.maxTemp}</td>
                    <td className="px-5 py-3 text-right">{row.minTemp}</td>
                    <td className="px-5 py-3 text-right">{row.precip}</td>
                    <td className="px-5 py-3 text-right">{row.wind}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>Rows:</span>
              {[10, 20, 50].map(num => (
                <button
                  key={num}
                  onClick={() => handleRowsChange(num)}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    rowsPerPage === num
                      ? 'bg-[#008394] text-white font-medium'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <span>Page {currentPage} of {totalPages} · {totalDays} days</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                >
                  Previous
                </button>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}