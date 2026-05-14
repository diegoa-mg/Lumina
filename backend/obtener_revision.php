<?php

header('Content-Type: application/json');

include 'conexion_bd.php';
include 'post_helpers.php';

$tipo_select = publicaciones_tiene_columna($conexion, 'tipo')
    ? "publicaciones.tipo"
    : "'articulo' AS tipo";

$sql = "
SELECT
    publicaciones.id,
    publicaciones.titulo,
    publicaciones.descripcion,
    publicaciones.imagen_url,
    publicaciones.status,
    $tipo_select,
    publicaciones.categoria_id,
    categorias.nombre_categoria AS materia,
    publicaciones.fecha_creacion
FROM publicaciones
LEFT JOIN categorias
ON publicaciones.categoria_id = categorias.id
WHERE publicaciones.status = 'revision'
ORDER BY publicaciones.fecha_creacion DESC
";

$resultado = $conexion->query($sql);
$posts = [];

if ($resultado) {
    while ($fila = $resultado->fetch_assoc()) {
        $posts[] = $fila;
    }
}

echo json_encode($posts);

$conexion->close();

?>
