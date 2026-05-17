<?php
// backend/obtener_posts.php

header('Content-Type: application/json');

session_start();

include 'conexion_bd.php';
include 'post_helpers.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode([]);
    exit;
}

$autor_id = intval($_SESSION['usuario_id']);
$tipo_select = publicaciones_tiene_columna($conexion, 'tipo')
    ? "tipo"
    : "'articulo' AS tipo";

$observaciones_select = publicaciones_tiene_columna($conexion, 'observaciones_editor')
    ? 'publicaciones.observaciones_editor AS observaciones'
    : "NULL AS observaciones";

$query = "
SELECT
    publicaciones.id,
    publicaciones.titulo,
    publicaciones.descripcion,
    publicaciones.imagen_url,
    publicaciones.status,
    $tipo_select,
    publicaciones.categoria_id,
    categorias.nombre_categoria AS materia,
    publicaciones.fecha_creacion,
    $observaciones_select
FROM publicaciones
LEFT JOIN categorias
ON publicaciones.categoria_id = categorias.id
WHERE autor_id = ?
ORDER BY publicaciones.id DESC
";

$stmt = $conexion->prepare($query);

if (!$stmt) {
    echo json_encode([]);
    exit;
}

$stmt->bind_param("i", $autor_id);
$stmt->execute();
$resultado = $stmt->get_result();

$posts = [];

while ($fila = $resultado->fetch_assoc()) {
    $posts[] = $fila;
}

echo json_encode($posts);

$stmt->close();
$conexion->close();

?>
