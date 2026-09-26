import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function OnboardingPage() {
  const [code, setCode] = useState('')
  const navigate = useNavigate()

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock logic
    if (code) {
      navigate('/app/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="glass w-full max-w-md p-8 rounded-2xl flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-2">Entrar em uma Sala</h1>
          <p className="text-muted-foreground text-sm">Digite o código de convite fornecido pelo seu líder de turma para ser adicionado à sua sala.</p>
        </div>
        
        <form onSubmit={handleJoin} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="code" className="text-sm font-medium">Código de Convite</label>
            <input 
              id="code"
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex: ETEC-3B-2026" 
              className="px-4 py-2 rounded-md bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity font-medium">
            Entrar na Sala
          </button>
        </form>
      </div>
    </div>
  )
}
