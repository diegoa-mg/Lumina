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
$seccion_select = publicaciones_tiene_columna($conexion, 'seccion')
    ? 'publicaciones.seccion'
    : "'post' AS seccion";
$tipo_aviso_select = publicaciones_tiene_columna($conexion, 'tipo_aviso')
    ? 'publicaciones.tipo_aviso'
    : "'academico' AS tipo_aviso";
$urgente_select = publicaciones_tiene_columna($conexion, 'urgente')
    ? 'publicaciones.urgente'
    : "0 AS urgente";
$importante_select = publicaciones_tiene_columna($conexion, 'importante')
    ? 'publicaciones.importante'
    : "0 AS importante";
$youtube_select = publicaciones_tiene_columna($conexion, 'youtube_url')
    ? 'publicaciones.youtube_url'
    : "NULL AS youtube_url";
$video_select = publicaciones_tiene_columna($conexion, 'video_url')
    ? 'publicaciones.video_url'
    : "NULL AS video_url";
$archivo_select = publicaciones_tiene_columna($conexion, 'archivo_url')
    ? 'publicaciones.archivo_url'
    : (publicaciones_tiene_columna($conexion, 'recurso_url')
        ? 'publicaciones.recurso_url'
    : (publicaciones_tiene_columna($conexion, 'noticia_url')
        ? 'publicaciones.noticia_url'
        : "NULL"));

$query = "
SELECT
    publicaciones.id,
    publicaciones.titulo,
    publicaciones.descripcion,
    publicaciones.imagen_url,
    publicaciones.status,
    $tipo_select,
    $seccion_select,
    $tipo_aviso_select,
    $urgente_select,
    $importante_select,
    $youtube_select,
    $video_select,
    $archivo_select AS archivo_url,
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
