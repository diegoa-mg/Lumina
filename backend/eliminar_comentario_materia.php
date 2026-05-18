<?php

header('Content-Type: application/json');
session_start();

include 'conexion_bd.php';
include 'comentarios_materia_helpers.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Debes iniciar sesion']);
    exit;
}

$usuario_id = intval($_SESSION['usuario_id']);
$stmt_rol = $conexion->prepare("SELECT rol_id FROM usuarios WHERE id = ? LIMIT 1");

if (!$stmt_rol) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error SQL']);
    exit;
}

$stmt_rol->bind_param('i', $usuario_id);
$stmt_rol->execute();
$rol = $stmt_rol->get_result()->fetch_assoc();
$stmt_rol->close();

if (intval($rol['rol_id'] ?? 0) !== 4) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Solo administradores pueden borrar comentarios']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    $data = $_POST;
}

$comentario_id = intval($data['comentario_id'] ?? 0);

if ($comentario_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Comentario invalido']);
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

$stmt = $conexion->prepare("DELETE FROM comentarios_materia WHERE id = ?");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error SQL']);
    exit;
}

$stmt->bind_param('i', $comentario_id);
$stmt->execute();
$eliminado = $stmt->affected_rows > 0;
$stmt->close();

if (!$eliminado) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Comentario no encontrado']);
    exit;
}

echo json_encode(['success' => true]);

$conexion->close();

?>
