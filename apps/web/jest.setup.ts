import '@testing-library/jest-dom'

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!('ResizeObserver' in global)) {
  ;(global as any).ResizeObserver = ResizeObserver
}
