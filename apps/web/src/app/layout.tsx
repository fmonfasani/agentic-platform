import './globals.css'
import { ReactNode } from 'react'
import { User, Bell, Settings } from 'lucide-react'

export const metadata = { 
  title: 'Sistema de Agentes Inteligentes', 
  description: 'Plataforma Unificada de Procesamiento' 
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="bg-slate-950 antialiased">
        <div className="flex min-h-screen flex-col">
          {/* Header */}
          <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
              {/* Logo & Title */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-base font-semibold text-slate-100">
                    Sistema de Agentes Autónomos Inteligentes
                  </h1>
                  <p className="text-xs text-slate-400">Plataforma Unificada de Procesamiento</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200">
                  <Bell className="h-5 w-5" />
                </button>
                <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200">
                  <Settings className="h-5 w-5" />
                </button>
                <div className="ml-2 h-8 w-px bg-slate-700" />
                <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10">
                    <User className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span>Admin</span>
                </button>
                <span className="ml-2 rounded-full bg-slate-800 px-2.5 py-1 text-xs font-mono text-slate-400">
                  v0.1.0
                </span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="border-t border-slate-800 bg-slate-900/50">
            <div className="mx-auto max-w-7xl px-6 py-6">
              <div className="flex flex-col items-center justify-between gap-4 text-sm text-slate-400 md:flex-row">
                <p> by @fmonfasani. Todos los derechos reservados.</p>
                <div className="flex gap-6">
                  <a href="#" className="transition-colors hover:text-slate-200">Documentación</a>
                  <a href="#" className="transition-colors hover:text-slate-200">Soporte</a>
                  <a href="#" className="transition-colors hover:text-slate-200">Términos</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}