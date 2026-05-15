ALTER TABLE publicaciones
  ADD COLUMN IF NOT EXISTS importante TINYINT(1) NOT NULL DEFAULT 0 AFTER urgente,
  ADD INDEX IF NOT EXISTS idx_importante_status (importante, status);
