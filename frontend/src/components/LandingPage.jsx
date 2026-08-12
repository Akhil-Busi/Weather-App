import { Cloud, CloudSun, Database, LineChart, ArrowRight } from 'lucide-react'

export default function LandingPage({ onEnter }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 flex flex-col items-center pt-6 md:pt-12 px-4 md:px-8">
      
      {/* Header Branding */}
      <div className="w-full max-w-5xl flex items-start gap-3 mb-8 md:mb-12 border-b border-slate-200 pb-6">
        <div className="p-2 bg-[#e6f3f5] text-[#008394] rounded-full">
          <Cloud size={24} />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-800 leading-tight">Historic Weather</h1>
          <p className="text-xs text-slate-500 mt-1">Fetch once, store as a file, visualize offline</p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="w-full max-w-5xl bg-[#f0f6f8] rounded-[2rem] p-10 md:p-20 text-center flex flex-col items-center justify-center mb-8">
        <div className="p-4 bg-[#e6f3f5] text-[#008394] rounded-2xl mb-8">
          <CloudSun size={36} />
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#0f172a] mb-6 tracking-tight">
          Historical climate data,<br className="hidden md:block" /> made simple
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl mb-10">
          Fetch daily weather for any coordinates, store it as reusable files, and explore temperature trends with charts and tables.
        </p>
        <button
          onClick={onEnter}
          className="bg-[#008394] hover:bg-[#006f7e] text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          Let's Go <ArrowRight size={18} />
        </button>
      </div>

      {/* Features Grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
        
        {/* Card 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="w-10 h-10 bg-[#e6f3f5] text-[#008394] rounded-lg flex items-center justify-center mb-4">
            <CloudSun size={20} />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-2">Fetch weather</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Query daily climate data by coordinates and date range from a trusted public source.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="w-10 h-10 bg-[#e6f3f5] text-[#008394] rounded-lg flex items-center justify-center mb-4">
            <Database size={20} />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-2">Store as files</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Keep downloaded datasets as reusable files so you never repeat the same API call.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="w-10 h-10 bg-[#e6f3f5] text-[#008394] rounded-lg flex items-center justify-center mb-4">
            <LineChart size={20} />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-2">Visualize trends</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Explore max/min temperature charts and paginated daily records at a glance.
          </p>
        </div>

      </div>
    </div>
  )
}
