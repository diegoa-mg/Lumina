<?php

header('Content-Type: application/json');

include 'conexion_bd.php';
include 'comentarios_materia_helpers.php';

$categoria_id = intval($_GET['categoria_id'] ?? 0);

if ($categoria_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Materia invalida']);
    exit;
}

try {
    if (!asegurar_tabla_comentarios_materia($conexion)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'No se pudo preparar la tabla de comentarios']);
        exit;
    }
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No se pudo preparar la tabla de comentarios']);
    exit;
}

$stmt = $conexion->prepare("
    SELECT
        comentarios_materia.id,
        comentarios_materia.comentario,
        comentarios_materia.fecha_creacion,
        usuarios.nombre,
        usuarios.foto_url
    FROM comentarios_materia
    INNER JOIN usuarios
    ON usuarios.id = comentarios_materia.usuario_id
    WHERE comentarios_materia.categoria_id = ?
    ORDER BY comentarios_materia.fecha_creacion DESC
");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error SQL']);
    exit;
}

$stmt->bind_param('i', $categoria_id);
$stmt->execute();
$resultado = $stmt->get_result();
$comentarios = [];

while ($fila = $resultado->fetch_assoc()) {
    $comentarios[] = $fila;
}

$stmt->close();

echo json_encode([
    'success' => true,
    'comentarios' => $comentarios
]);

$conexion->close();

?>
