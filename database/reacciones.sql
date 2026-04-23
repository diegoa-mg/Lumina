-- Asegúrate de estar en la base de datos login_bd
USE `login_bd`;

CREATE TABLE `reacciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,      -- Se conecta con el id de tu tabla usuarios
  `elemento_id` int(11) NOT NULL,     -- El ID del recurso o aviso (ej. 1, 2, 3)
  `seccion` varchar(50) NOT NULL,     -- Aquí guardas 'recursos' o 'avisos'
  `tipo_reaccion` varchar(20) NOT NULL, -- Aquí guardas 'like' o 'favorito'
  `fecha` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  -- Esta línea une esta tabla con la tuya de usuarios
  CONSTRAINT `fk_usuario_reaccion` 
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;