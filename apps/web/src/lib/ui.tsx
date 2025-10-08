export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-5 w-1 rounded bg-green600" />
      <h3 className="text-white/90 tracking-wide text-sm font-medium uppercase">{children}</h3>
    </div>
  )
}
