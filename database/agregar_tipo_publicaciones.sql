ALTER TABLE publicaciones
ADD COLUMN tipo enum('articulo','video','noticia','recurso') NOT NULL DEFAULT 'articulo'
AFTER imagen_url;
