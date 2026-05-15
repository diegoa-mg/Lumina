-- Agregar columnas para URLs de YouTube y Noticias a la tabla publicaciones
-- Ejecutar este script en phpMyAdmin o MySQL

ALTER TABLE `publicaciones` 
ADD COLUMN `youtube_url` varchar(500) DEFAULT NULL AFTER `tipo`,
ADD COLUMN `noticia_url` varchar(500) DEFAULT NULL AFTER `youtube_url`;
