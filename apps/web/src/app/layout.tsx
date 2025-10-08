import './globals.css'
import { ReactNode } from 'react'

export const metadata = { title: 'Sistema de Agentes Inteligentes', description: 'Demo local' }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body>
        <header className="border-b border-white/10 bg-blue800/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-green600" />
              <div>
                <div className="text-white font-medium">Sistema de Agentes Autonomos Inteligentes</div>
                <div className="text-white/50 text-xs">Plataforma Unificada de Procesamiento</div>
              </div>
            </div>
            <div className="text-white/50 text-xs">v0.1.0</div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
      </body>
    </html>
  )
}
