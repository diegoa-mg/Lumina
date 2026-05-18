<?php

header('Content-Type: application/json');

include 'conexion_bd.php';
include 'post_helpers.php';

$categoria_id = intval($_GET['categoria_id'] ?? 0);
$seccion = trim(strtolower($_GET['seccion'] ?? ''));
$solo_importante = isset($_GET['importante']) ? intval($_GET['importante']) : -1;
$tipo_select = publicaciones_tiene_columna($conexion, 'tipo')
    ? "publicaciones.tipo"
    : "'articulo' AS tipo";
$youtube_select = publicaciones_tiene_columna($conexion, 'youtube_url')
    ? "publicaciones.youtube_url"
    : "NULL AS youtube_url";
$noticia_select = publicaciones_tiene_columna($conexion, 'noticia_url')
    ? "publicaciones.noticia_url"
    : "NULL AS noticia_url";
$seccion_select = publicaciones_tiene_columna($conexion, 'seccion')
    ? "publicaciones.seccion"
    : "'post' AS seccion";
$importante_select = publicaciones_tiene_columna($conexion, 'importante')
    ? "publicaciones.importante"
    : "0 AS importante";
$tipo_aviso_select = publicaciones_tiene_columna($conexion, 'tipo_aviso')
    ? "publicaciones.tipo_aviso"
    : "'academico' AS tipo_aviso";
$urgente_select = publicaciones_tiene_columna($conexion, 'urgente')
    ? "publicaciones.urgente"
    : "0 AS urgente";

$where_categoria = $categoria_id > 0
    ? "AND publicaciones.categoria_id = ?"
    : "";
$where_seccion = ($seccion === 'post' || $seccion === 'aviso')
    ? "AND publicaciones.seccion = ?"
    : "";
$where_importante = $solo_importante === 1
    ? "AND publicaciones.importante = 1"
    : "";

$sql = "
SELECT
    publicaciones.id,
    publicaciones.titulo,
    publicaciones.descripcion,
    publicaciones.imagen_url,
    publicaciones.status,
    $youtube_select,
    $noticia_select,
    $seccion_select,
    $importante_select,
    $tipo_aviso_select,
    $urgente_select,
    $tipo_select,
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
$where_categoria
$where_seccion
$where_importante
ORDER BY publicaciones.fecha_creacion DESC
";

$stmt = $conexion->prepare($sql);
$posts = [];

if ($stmt) {
    $tipos = '';
    $parametros = [];

    if ($categoria_id > 0) {
        $tipos .= "i";
        $parametros[] = $categoria_id;
    }

    if ($where_seccion !== '') {
        $tipos .= "s";
        $parametros[] = $seccion;
    }

    if ($tipos !== '') {
        $stmt->bind_param($tipos, ...$parametros);
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
