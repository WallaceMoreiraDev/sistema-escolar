export const getSenderIcon = (sender: string) => {
  const normalized = sender.toLowerCase();
  
  if (normalized.includes('diretoria')) {
    // Ícone de prédio corporativo/escola (combina com Diretoria)
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );
  }
  
  if (normalized.includes('coordenação')) {
    // Ícone de acadêmico/capelo (combina com Coordenação Pedagógica)
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    );
  }
  
  // Administração (Default)
  // Ícone de maleta (combina com administração / secretaria)
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
};

export const getNoticeTypeConfig = (badge: string) => {
  switch (badge) {
    case 'Urgente': 
      return {
        borderClass: 'bg-red-500',
        badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
        modalHeaderBgClass: 'bg-red-50/50 dark:bg-red-900/10'
      };
    case 'Evento': 
      return {
        borderClass: 'bg-emerald-500',
        badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
        modalHeaderBgClass: 'bg-emerald-50/50 dark:bg-emerald-900/10'
      };
    default: 
      return {
        borderClass: 'bg-blue-500',
        badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
        modalHeaderBgClass: 'bg-blue-50/50 dark:bg-blue-900/10'
      };
  }
};
