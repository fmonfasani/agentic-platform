-- ==========================================================
-- 🧠 Estructura de tabla para diagnósticos Git Autopilot
-- ==========================================================

CREATE TABLE IF NOT EXISTS git_diagnostics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  local_branch TEXT,
  remote_branch TEXT,
  ahead INTEGER DEFAULT 0,
  behind INTEGER DEFAULT 0,
  staged_count INTEGER DEFAULT 0,
  unstaged_count INTEGER DEFAULT 0,
  untracked_count INTEGER DEFAULT 0,
  is_tracking INTEGER DEFAULT 0,
  is_synced INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS git_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  value REAL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS git_reflections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  insight TEXT,
  agent TEXT DEFAULT 'git'
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_gitdiag_timestamp ON git_diagnostics (timestamp);
CREATE INDEX IF NOT EXISTS idx_gitmetric_timestamp ON git_metrics (timestamp);
CREATE INDEX IF NOT EXISTS idx_gitref_timestamp ON git_reflections (timestamp);
