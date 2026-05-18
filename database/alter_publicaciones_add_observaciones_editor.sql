-- Agrega el campo de observaciones que usan los editores al rechazar un post
ALTER TABLE publicaciones
ADD COLUMN observaciones_editor TEXT DEFAULT NULL;
