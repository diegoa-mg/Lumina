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
$video_select = publicaciones_tiene_columna($conexion, 'video_url')
    ? "publicaciones.video_url"
    : "NULL AS video_url";
$archivo_select = publicaciones_tiene_columna($conexion, 'archivo_url')
    ? "publicaciones.archivo_url"
    : (publicaciones_tiene_columna($conexion, 'recurso_url')
        ? "publicaciones.recurso_url"
    : (publicaciones_tiene_columna($conexion, 'noticia_url')
        ? "publicaciones.noticia_url"
        : "NULL"));
$seccion_select = publicaciones_tiene_columna($conexion, 'seccion')
    ? "CASE WHEN publicaciones.seccion = 'aviso' OR publicaciones.categoria_id = 9 THEN 'aviso' ELSE publicaciones.seccion END AS seccion"
    : "CASE WHEN publicaciones.categoria_id = 9 THEN 'aviso' ELSE 'post' END AS seccion";
$importante_select = publicaciones_tiene_columna($conexion, 'importante')
    ? "CASE WHEN publicaciones.importante = 1 OR ((publicaciones.seccion = 'aviso' OR publicaciones.categoria_id = 9) AND publicaciones.imagen_url IS NOT NULL AND publicaciones.imagen_url <> '') THEN 1 ELSE 0 END AS importante"
    : "CASE WHEN publicaciones.categoria_id = 9 AND publicaciones.imagen_url IS NOT NULL AND publicaciones.imagen_url <> '' THEN 1 ELSE 0 END AS importante";
$tipo_aviso_select = publicaciones_tiene_columna($conexion, 'tipo_aviso')
    ? "publicaciones.tipo_aviso"
    : "'academico' AS tipo_aviso";
$urgente_select = publicaciones_tiene_columna($conexion, 'urgente')
    ? "publicaciones.urgente"
    : "0 AS urgente";

$where_categoria = $categoria_id > 0
    ? "AND publicaciones.categoria_id = ?"
    : "";
$where_seccion = "";
if ($seccion === 'post' || $seccion === 'aviso') {
    $where_seccion = publicaciones_tiene_columna($conexion, 'seccion')
        ? ($seccion === 'aviso' ? "AND (publicaciones.seccion = ? OR publicaciones.categoria_id = 9)" : "AND publicaciones.seccion = ? AND (publicaciones.categoria_id <> 9 OR publicaciones.categoria_id IS NULL)")
        : ($seccion === 'aviso' ? "AND publicaciones.categoria_id = 9" : "AND (publicaciones.categoria_id <> 9 OR publicaciones.categoria_id IS NULL)");
}
$where_importante = $solo_importante === 1
    ? (publicaciones_tiene_columna($conexion, 'importante') ? "AND (publicaciones.importante = 1 OR ((publicaciones.seccion = 'aviso' OR publicaciones.categoria_id = 9) AND publicaciones.imagen_url IS NOT NULL AND publicaciones.imagen_url <> ''))" : "AND publicaciones.categoria_id = 9 AND publicaciones.imagen_url IS NOT NULL AND publicaciones.imagen_url <> ''")
    : "";

$sql = "
SELECT
    publicaciones.id,
    publicaciones.titulo,
    publicaciones.descripcion,
    publicaciones.imagen_url,
    publicaciones.status,
    $youtube_select,
    $video_select,
    $archivo_select AS archivo_url,
    $seccion_select,
    $importante_select,
    $tipo_aviso_select,
    $urgente_select,
    $tipo_select,
    publicaciones.categoria_id,
    categorias.nombre_categoria AS materia,
    publicaciones.fecha_creacion,
    usuarios.nombre AS autor,
    usuarios.foto_url AS autor_foto,
    COALESCE(reacciones_conteo.likes, 0) AS likes_count
FROM publicaciones
INNER JOIN usuarios
ON publicaciones.autor_id = usuarios.id
LEFT JOIN categorias
ON publicaciones.categoria_id = categorias.id
LEFT JOIN (
    SELECT elemento_id, COUNT(*) AS likes
    FROM reacciones
    WHERE seccion = 'recursos'
    AND tipo_reaccion = 'like'
    GROUP BY elemento_id
) AS reacciones_conteo
ON reacciones_conteo.elemento_id = publicaciones.id
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

    if ($where_seccion !== '' && publicaciones_tiene_columna($conexion, 'seccion')) {
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
