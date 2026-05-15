CREATE TABLE IF NOT EXISTS reacciones (
  id INT(11) NOT NULL AUTO_INCREMENT,
  usuario_id INT(11) NOT NULL,
  elemento_id INT(11) NOT NULL,
  seccion VARCHAR(50) NOT NULL DEFAULT 'recursos',
  tipo_reaccion VARCHAR(20) NOT NULL,
  fecha TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DELETE r1
FROM reacciones r1
INNER JOIN reacciones r2
  ON r1.usuario_id = r2.usuario_id
  AND r1.elemento_id = r2.elemento_id
  AND r1.seccion = r2.seccion
  AND r1.tipo_reaccion = r2.tipo_reaccion
  AND r1.id > r2.id;

ALTER TABLE reacciones
  ADD UNIQUE KEY uq_reaccion_usuario_elemento_tipo (usuario_id, elemento_id, seccion, tipo_reaccion),
  ADD KEY idx_reacciones_usuario_tipo (usuario_id, tipo_reaccion),
  ADD KEY idx_reacciones_elemento (elemento_id, seccion);
