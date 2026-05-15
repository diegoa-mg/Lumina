ALTER TABLE publicaciones
  ADD COLUMN IF NOT EXISTS seccion ENUM('post','aviso') NOT NULL DEFAULT 'post' AFTER tipo,
  ADD COLUMN IF NOT EXISTS tipo_aviso ENUM('academico','plataforma') NOT NULL DEFAULT 'academico' AFTER seccion,
  ADD COLUMN IF NOT EXISTS urgente TINYINT(1) NOT NULL DEFAULT 0 AFTER tipo_aviso,
  ADD INDEX IF NOT EXISTS idx_seccion_status (seccion, status);
