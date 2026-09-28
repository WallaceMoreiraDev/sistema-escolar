import { InviteSection } from './components/InviteSection';
import { EventManagementSection } from './components/EventManagementSection';
import { MemberManagementSection } from './components/MemberManagementSection';

export function ClassAdminPage() {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Administração da Turma</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Área restrita para líderes. Gerencie convites, eventos e membros.
        </p>
      </header>

      <div className="space-y-8 max-w-4xl">
        {/* ÁREA 1: Gestão de Convites */}
        <InviteSection />
        
        {/* ÁREA 2: Gestão de Eventos (CRUD) */}
        <EventManagementSection />
        
        {/* ÁREA 4: Gestão de Membros */}
        <MemberManagementSection />
      </div>
    </div>
  );
}
