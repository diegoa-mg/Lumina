<?php

header('Content-Type: application/json');
session_start();

include 'conexion_bd.php';
include 'post_helpers.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => true, 'reacciones' => []]);
    exit;
}

$usuario_id = intval($_SESSION['usuario_id']);
$where_like_solo_posts = publicaciones_tiene_columna($conexion, 'seccion')
    ? "AND (reacciones.tipo_reaccion <> 'like' OR (publicaciones.seccion = 'post' AND (publicaciones.categoria_id <> 9 OR publicaciones.categoria_id IS NULL)))"
    : "AND (reacciones.tipo_reaccion <> 'like' OR (publicaciones.categoria_id <> 9 OR publicaciones.categoria_id IS NULL))";

$stmt = $conexion->prepare("
    SELECT reacciones.elemento_id, reacciones.seccion, reacciones.tipo_reaccion
    FROM reacciones
    INNER JOIN publicaciones
    ON publicaciones.id = reacciones.elemento_id
    WHERE reacciones.usuario_id = ?
    AND publicaciones.status = 'publicado'
    $where_like_solo_posts
");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error SQL']);
    exit;
}

$stmt->bind_param('i', $usuario_id);
$stmt->execute();
$resultado = $stmt->get_result();
$reacciones = [];

while ($fila = $resultado->fetch_assoc()) {
    $reacciones[] = [
        'elemento_id' => intval($fila['elemento_id']),
        'seccion' => $fila['seccion'],
        'tipo' => $fila['tipo_reaccion']
    ];
}

$stmt->close();

echo json_encode([
    'success' => true,
    'reacciones' => $reacciones
]);

$conexion->close();

?>
