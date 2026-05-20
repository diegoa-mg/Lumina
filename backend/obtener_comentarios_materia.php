<?php

header('Content-Type: application/json');

session_start();

include 'conexion_bd.php';
include 'comentarios_materia_helpers.php';

$categoria_id = intval($_GET['categoria_id'] ?? 0);

// Usuario actual: para marcar que comentarios puede borrar (propios o todos si es admin).
$usuario_actual = isset($_SESSION['usuario_id']) ? intval($_SESSION['usuario_id']) : 0;
$es_admin = false;

if ($usuario_actual > 0) {
    $rol_stmt = $conexion->prepare("SELECT rol_id FROM usuarios WHERE id = ?");
    $rol_stmt->bind_param('i', $usuario_actual);
    $rol_stmt->execute();
    $rol_row = $rol_stmt->get_result()->fetch_assoc();
    $rol_stmt->close();
    $es_admin = intval($rol_row['rol_id'] ?? 0) === 4;
}

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
        comentarios_materia.usuario_id,
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
    $fila['puede_eliminar'] = $es_admin
        || ($usuario_actual > 0 && intval($fila['usuario_id']) === $usuario_actual);
    $comentarios[] = $fila;
}

$stmt->close();

echo json_encode([
    'success' => true,
    'comentarios' => $comentarios
]);

$conexion->close();

?>
