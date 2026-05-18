<?php

header('Content-Type: application/json');
session_start();

include 'conexion_bd.php';
include 'post_helpers.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Debes iniciar sesion']);
    exit;
}

$tipo_reaccion = trim(strtolower($_GET['tipo'] ?? ''));
if (!in_array($tipo_reaccion, ['like', 'guardado'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Tipo de reaccion invalido']);
    exit;
}

$usuario_id = intval($_SESSION['usuario_id']);
$tipo_select = publicaciones_tiene_columna($conexion, 'tipo')
    ? "publicaciones.tipo"
    : "'articulo' AS tipo";
$tiene_seccion = publicaciones_tiene_columna($conexion, 'seccion');
$seccion_select = $tiene_seccion
    ? "publicaciones.seccion"
    : "'post' AS seccion";
$where_like_solo_posts = $tipo_reaccion === 'like'
    ? ($tiene_seccion
        ? "AND publicaciones.seccion = 'post' AND (publicaciones.categoria_id <> 9 OR publicaciones.categoria_id IS NULL)"
        : "AND (publicaciones.categoria_id <> 9 OR publicaciones.categoria_id IS NULL)")
    : "";
$importante_select = publicaciones_tiene_columna($conexion, 'importante')
    ? "publicaciones.importante"
    : "0 AS importante";
$tipo_aviso_select = publicaciones_tiene_columna($conexion, 'tipo_aviso')
    ? "publicaciones.tipo_aviso"
    : "'academico' AS tipo_aviso";
$urgente_select = publicaciones_tiene_columna($conexion, 'urgente')
    ? "publicaciones.urgente"
    : "0 AS urgente";

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
    $tipo_aviso_select,
    $urgente_select,
    publicaciones.categoria_id,
    categorias.nombre_categoria AS materia,
    publicaciones.fecha_creacion,
    usuarios.nombre AS autor,
    usuarios.foto_url AS autor_foto,
    reacciones.fecha AS fecha_reaccion
FROM reacciones
INNER JOIN publicaciones
ON publicaciones.id = reacciones.elemento_id
INNER JOIN usuarios
ON usuarios.id = publicaciones.autor_id
LEFT JOIN categorias
ON categorias.id = publicaciones.categoria_id
WHERE reacciones.usuario_id = ?
AND reacciones.tipo_reaccion = ?
AND publicaciones.status = 'publicado'
$where_like_solo_posts
ORDER BY reacciones.fecha DESC
";

$stmt = $conexion->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error SQL: ' . $conexion->error]);
    exit;
}

$stmt->bind_param('is', $usuario_id, $tipo_reaccion);
$stmt->execute();
$resultado = $stmt->get_result();
$publicaciones = [];

while ($fila = $resultado->fetch_assoc()) {
    $publicaciones[] = $fila;
}

$stmt->close();

echo json_encode([
    'success' => true,
    'publicaciones' => $publicaciones
]);

$conexion->close();

?>
