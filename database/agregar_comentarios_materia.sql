CREATE TABLE IF NOT EXISTS comentarios_materia (
  id INT(11) NOT NULL AUTO_INCREMENT,
  categoria_id INT(11) NOT NULL,
  usuario_id INT(11) NOT NULL,
  comentario TEXT NOT NULL,
  fecha_creacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_comentarios_materia_categoria (categoria_id, fecha_creacion),
  KEY idx_comentarios_materia_usuario (usuario_id),
  CONSTRAINT fk_comentarios_materia_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
  CONSTRAINT fk_comentarios_materia_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
