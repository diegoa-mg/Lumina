<?php

header('Content-Type: application/json');
session_start();

include 'conexion_bd.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

$usuario_id = intval($_SESSION['usuario_id']);

$rol_stmt = $conexion->prepare("SELECT rol_id FROM usuarios WHERE id = ?");
$rol_stmt->bind_param('i', $usuario_id);
$rol_stmt->execute();
$rol_row = $rol_stmt->get_result()->fetch_assoc();
$rol_stmt->close();

$es_admin = intval($rol_row['rol_id'] ?? 0) === 4;

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

// El comentario lo puede borrar su autor, o cualquier administrador.
$dueno_stmt = $conexion->prepare("SELECT usuario_id FROM comentarios_materia WHERE id = ?");
$dueno_stmt->bind_param('i', $comentario_id);
$dueno_stmt->execute();
$dueno_row = $dueno_stmt->get_result()->fetch_assoc();
$dueno_stmt->close();

if (!$dueno_row) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Comentario no encontrado']);
    exit;
}

$es_dueno = intval($dueno_row['usuario_id']) === $usuario_id;

if (!$es_admin && !$es_dueno) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'No puedes borrar este comentario']);
    exit;
}

$stmt = $conexion->prepare("DELETE FROM comentarios_materia WHERE id = ?");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error SQL']);
    exit;
}

$stmt->bind_param('i', $comentario_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No se pudo borrar el comentario']);
}

$stmt->close();
$conexion->close();

?>
