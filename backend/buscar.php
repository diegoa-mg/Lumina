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

$sql = "
    SELECT
        publicaciones.id,
        publicaciones.titulo,
        publicaciones.descripcion,
        publicaciones.imagen_url,
        $tipo_select,
        publicaciones.categoria_id,
        categorias.nombre_categoria AS materia,
        publicaciones.fecha_creacion,
        usuarios.nombre AS autor,
        usuarios.foto_url AS autor_foto
    FROM publicaciones
    INNER JOIN usuarios ON publicaciones.autor_id = usuarios.id
    LEFT JOIN categorias ON publicaciones.categoria_id = categorias.id
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
