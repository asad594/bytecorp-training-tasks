export default function CategoryCard({ category, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 p-6 rounded-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-800/80 group-hover:bg-cyan-500/10 border border-slate-700/50 group-hover:border-cyan-500/30 flex items-center justify-center text-2xl transition-colors">
          {category.icon}
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 group-hover:bg-cyan-500/20 text-slate-400 group-hover:text-cyan-300 transition-colors">
          {category.count} Jobs
        </span>
      </div>
      <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
        {category.name}
      </h3>
      <p className="text-xs text-slate-400 mt-1">Avg: {category.avgSalary}</p>
    </div>
  )
}
