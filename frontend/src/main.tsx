import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { ApiError } from './utils/apiError';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutos de cache
      gcTime: 1000 * 60 * 10, // 10 minutos de retenção
      refetchOnWindowFocus: false, // Desativa refetches fantasmas ao alternar de aba no celular
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

// Trava estrita de inicialização no Tema Claro Oficial
if (typeof document !== 'undefined') {
  document.documentElement.classList.remove('dark');
  document.documentElement.removeAttribute('data-theme');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
