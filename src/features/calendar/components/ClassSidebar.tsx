import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const mockLinks = [
  { id: 1, title: 'Google Meet (Aula ao vivo)', url: '#' },
  { id: 2, title: 'Google Drive (Materiais)', url: '#' },
  { id: 3, title: 'Grupo do WhatsApp', url: '#' },
  { id: 4, title: 'Plano de Ensino (PDF)', url: '#' },
  { id: 5, title: 'Apostila Bimestre 1', url: '#' },
];

const mockMembers = [
  { id: '1', name: 'Ana Souza', role: 'LEADER' },
  { id: '2', name: 'Carlos Ferreira', role: 'STUDENT' },
  { id: '3', name: 'Beatriz Lima', role: 'STUDENT' },
  { id: '4', name: 'Daniel Silva', role: 'STUDENT' },
  { id: '5', name: 'Fernanda Gomes', role: 'STUDENT' },
  { id: '6', name: 'Gabriel Costa', role: 'STUDENT' },
  { id: '7', name: 'Helena Mendes', role: 'STUDENT' },
];

export function ClassSidebar() {
  const navigate = useNavigate();
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  
  // Líderes no topo
  const sortedMembers = [...mockMembers].sort((a, b) => {
    if (a.role === 'LEADER' && b.role !== 'LEADER') return -1;
    if (a.role !== 'LEADER' && b.role === 'LEADER') return 1;
    return a.name.localeCompare(b.name);
  });

  const handleLeaveClass = () => {
    // Redireciona para o dashboard com estado vazio
    navigate('/app/dashboard');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Bloco D: Acesso Rápido */}
      <div className="lg:col-span-1 glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 h-fit">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          Links Rápidos
        </h3>
        <div className="flex flex-col gap-2">
          {mockLinks.map(link => (
            <a 
              key={link.id} 
              href={link.url}
              className="px-4 py-3 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-between group shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <span className="line-clamp-1">{link.title}</span>
              <svg className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Bloco E: Lista de Membros */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Membros
            </h3>
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-xs font-bold">
              {mockMembers.length} Alunos
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {sortedMembers.map(member => (
              <div 
                key={member.id} 
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                  member.role === 'LEADER' 
                    ? 'bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <span className={`text-sm font-semibold ${member.role === 'LEADER' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                  {member.name}
                </span>
                
                {member.role === 'LEADER' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded-md">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    Líder
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bloco F: Sair da Turma */}
        <div className="mt-2">
          {!showConfirmLeave ? (
            <button 
              onClick={() => setShowConfirmLeave(true)}
              className="w-full md:w-auto md:px-8 py-3.5 flex items-center justify-center gap-2 text-sm font-bold text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-500 dark:bg-rose-950/30 dark:hover:bg-rose-600 rounded-2xl transition-all border border-rose-100 dark:border-rose-900/50 ml-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Sair da Turma
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/50 animate-in fade-in zoom-in-95 duration-200 ml-auto w-full md:w-96">
              <p className="text-sm font-bold text-rose-700 dark:text-rose-300 mb-3 text-center">Tem certeza que deseja sair?</p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowConfirmLeave(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleLeaveClass}
                  className="flex-1 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors shadow-sm"
                >
                  Sim, Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
