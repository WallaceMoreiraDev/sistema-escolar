import { useNavigate, Link } from 'react-router-dom'
import { getNoticeTypeConfig, getSenderIcon } from '../../mural/utils/noticeUtils'
import { MOCK_NOTICES } from '../../mural/data/mockNotices'

export function MuralPreview() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Avisos Recentes da Escola</h3>
        <Link to="/app/mural" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Ver todos os avisos &rarr;</Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_NOTICES.map((notice: any) => {
          const typeConfig = getNoticeTypeConfig(notice.badge);
          const icon = getSenderIcon(notice.sender);
          return (
            <div 
              key={notice.id}
              onClick={() => navigate(`/app/mural/aviso/${notice.id}`)}
              className="glass-card p-5 relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all flex flex-col"
            >
              <div className={`absolute top-0 left-0 w-1 h-full ${typeConfig.borderClass}`}></div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${typeConfig.badgeClass}`}>
                  {notice.badge}
                </span>
                <span className="text-xs text-slate-400">{notice.date}</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1 mb-2 group-hover:text-primary transition-colors">{notice.title}</h4>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4">{notice.message}</p>
              
              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50">
                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <div className="scale-75">{icon}</div>
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{notice.sender}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
