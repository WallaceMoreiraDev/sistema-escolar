import { useState } from 'react'

export function AuthPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="glass w-full max-w-md p-8 rounded-2xl flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Bem-vindo</h1>
          <p className="text-muted-foreground">Faça login para acessar a plataforma escolar.</p>
        </div>
        
        <button className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 border border-slate-200 py-3 rounded-lg shadow-sm hover:bg-slate-50 transition-colors font-medium">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" className="w-5 h-5" />
          Entrar com Google
        </button>
      </div>
    </div>
  )
}
