ALTER TABLE `usuarios`
  ADD COLUMN IF NOT EXISTS `email_verificado` tinyint(1) NOT NULL DEFAULT 0 AFTER `correo`;

CREATE TABLE IF NOT EXISTS `cuenta_verificaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `codigo_hash` varchar(255) NOT NULL,
  `expira_en` datetime NOT NULL,
  `intentos` tinyint unsigned NOT NULL DEFAULT 0,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_cuenta_usuario` (`usuario_id`),
  KEY `idx_cuenta_correo` (`correo`),
  KEY `idx_cuenta_expira` (`expira_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
