<?php

header('Content-Type: application/json');

include 'conexion_bd.php';

$sql = "
SELECT
    publicaciones.*
FROM publicaciones
WHERE status = 'revision'
ORDER BY fecha_creacion DESC
";

$resultado = $conexion->query($sql);

$posts = [];

while($fila = $resultado->fetch_assoc()) {

    $posts[] = $fila;
}

echo json_encode($posts);

?>