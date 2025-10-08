import GlowHover from './GlowHover'

export function AgentCard({ title, subtitle, onOpen, tone }: {
  title: string
  subtitle?: string
  onOpen?: () => void
  tone?: 'green' | 'blue' | 'slate'
}) {
  const ring = tone === 'green' ? 'ring-green500/30' : tone === 'blue' ? 'ring-blue600/30' : 'ring-slate500/30'
  return (
    <GlowHover>
      <button
        onClick={onOpen}
        className={`w-full text-left rounded-2xl bg-blue700/60 hover:bg-blue700/80 border border-white/10 ring-0 focus-visible:outline-none focus-visible:ring-2 ${ring} shadow-card p-4 transition`}
      >
        <div className="text-sm text-white/90 font-semibold">{title}</div>
        {subtitle && <div className="text-xs text-white/60 mt-1">{subtitle}</div>}
      </button>
    </GlowHover>
  )
}
