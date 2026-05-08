<?php

header('Content-Type: application/json');
include 'conexion_bd.php';

$sql = "
SELECT 
    publicaciones.id,
    publicaciones.titulo,
    publicaciones.descripcion,
    publicaciones.imagen_url,
    publicaciones.status,
    publicaciones.fecha_creacion,
    usuarios.nombre AS autor
FROM publicaciones
INNER JOIN usuarios 
ON publicaciones.autor_id = usuarios.id
WHERE publicaciones.status = 'publicado'
ORDER BY publicaciones.fecha_creacion DESC
";

$resultado = $conexion->query($sql);

$posts = [];

while($fila = $resultado->fetch_assoc()) {
    $posts[] = $fila;
}

echo json_encode($posts);

?>