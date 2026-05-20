<?php

header('Content-Type: application/json');

include 'conexion_bd.php';
include 'post_helpers.php';

$q = trim($_GET['q'] ?? '');

if ($q === '') {
    echo json_encode([]);
    exit;
}

$busqueda = '%' . $q . '%';

$tipo_select = publicaciones_tiene_columna($conexion, 'tipo')
    ? "publicaciones.tipo"
    : "'articulo' AS tipo";
$archivo_select = publicaciones_tiene_columna($conexion, 'archivo_url')
    ? "publicaciones.archivo_url"
    : (publicaciones_tiene_columna($conexion, 'recurso_url')
        ? "publicaciones.recurso_url"
        : "NULL");
$youtube_select = publicaciones_tiene_columna($conexion, 'youtube_url')
    ? "publicaciones.youtube_url"
    : "NULL AS youtube_url";
$video_select = publicaciones_tiene_columna($conexion, 'video_url')
    ? "publicaciones.video_url"
    : "NULL AS video_url";

$sql = "
    SELECT
        publicaciones.id,
        publicaciones.titulo,
        publicaciones.descripcion,
        publicaciones.imagen_url,
        $tipo_select,
        $youtube_select,
        $video_select,
        $archivo_select AS archivo_url,
        publicaciones.categoria_id,
        categorias.nombre_categoria AS materia,
        publicaciones.fecha_creacion,
        usuarios.nombre AS autor,
        usuarios.foto_url AS autor_foto,
        COALESCE(reacciones_conteo.likes, 0) AS likes_count
    FROM publicaciones
    INNER JOIN usuarios ON publicaciones.autor_id = usuarios.id
    LEFT JOIN categorias ON publicaciones.categoria_id = categorias.id
    LEFT JOIN (
        SELECT elemento_id, COUNT(*) AS likes
        FROM reacciones
        WHERE seccion = 'recursos'
        AND tipo_reaccion = 'like'
        GROUP BY elemento_id
    ) AS reacciones_conteo
    ON reacciones_conteo.elemento_id = publicaciones.id
    WHERE publicaciones.status = 'publicado'
    AND (publicaciones.titulo LIKE ? OR publicaciones.descripcion LIKE ?)
    ORDER BY publicaciones.fecha_creacion DESC
";

$stmt = $conexion->prepare($sql);
$posts = [];

if ($stmt) {
    $stmt->bind_param("ss", $busqueda, $busqueda);
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
