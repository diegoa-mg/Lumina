<?php

header('Content-Type: application/json');

include 'conexion_bd.php';
include 'post_helpers.php';

$categoria_id = intval($_GET['categoria_id'] ?? 0);
$tipo_select = publicaciones_tiene_columna($conexion, 'tipo')
    ? "publicaciones.tipo"
    : "'articulo' AS tipo";
$seccion_select = publicaciones_tiene_columna($conexion, 'seccion')
    ? "publicaciones.seccion"
    : "'post' AS seccion";
$importante_select = publicaciones_tiene_columna($conexion, 'importante')
    ? "publicaciones.importante"
    : "0 AS importante";
$importante_where = publicaciones_tiene_columna($conexion, 'importante')
    ? "publicaciones.importante"
    : "0";
$where_seccion = publicaciones_tiene_columna($conexion, 'seccion')
    ? (
        $categoria_id > 0
            ? "AND publicaciones.seccion = 'post'"
            : "AND (publicaciones.seccion = 'post' OR (publicaciones.seccion = 'aviso' AND $importante_where = 1))"
    )
    : "";

$where_categoria = $categoria_id > 0
    ? "AND publicaciones.categoria_id = ?"
    : "";

$sql = "
SELECT
    publicaciones.id,
    publicaciones.titulo,
    publicaciones.descripcion,
    publicaciones.imagen_url,
    publicaciones.status,
    $tipo_select,
    $seccion_select,
    $importante_select,
    publicaciones.categoria_id,
    categorias.nombre_categoria AS materia,
    publicaciones.fecha_creacion,
    usuarios.nombre AS autor,
    usuarios.foto_url AS autor_foto
FROM publicaciones
INNER JOIN usuarios
ON publicaciones.autor_id = usuarios.id
LEFT JOIN categorias
ON publicaciones.categoria_id = categorias.id
WHERE publicaciones.status = 'publicado'
$where_seccion
$where_categoria
ORDER BY publicaciones.fecha_creacion DESC
";

$stmt = $conexion->prepare($sql);
$posts = [];

if ($stmt) {
    if ($categoria_id > 0) {
        $stmt->bind_param("i", $categoria_id);
    }

    $stmt->execute();
    $resultado = $stmt->get_result();

    while ($fila = $resultado->fetch_assoc()) {
        $posts[] = $fila;
    }

    $stmt->close();
}

echo json_encode($posts);

$conexion->close();

?>
