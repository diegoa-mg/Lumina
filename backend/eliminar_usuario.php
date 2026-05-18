<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

include 'conexion_bd.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'mensaje' => 'No hay sesión activa.']);
    exit;
}

$rolSesion = $_SESSION['rol'] ?? '';
if (strtolower($rolSesion) !== 'administrador') {
    http_response_code(403);
    echo json_encode(['ok' => false, 'mensaje' => 'Acceso denegado.']);
    exit;
}

$id = isset($_REQUEST['id']) ? intval($_REQUEST['id']) : 0;
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'mensaje' => 'ID de usuario inválido.']);
    exit;
}

if ($id === intval($_SESSION['usuario_id'])) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'mensaje' => 'No puedes eliminar tu propia cuenta.']);
    exit;
}

$stmt = $conexion->prepare('DELETE FROM usuarios WHERE id = ?');
$stmt->bind_param('i', $id);

if ($stmt->execute()) {
    echo json_encode(['ok' => true, 'mensaje' => 'Usuario eliminado correctamente.']);
    exit;
}

http_response_code(500);
echo json_encode(['ok' => false, 'mensaje' => 'Error al eliminar el usuario.']);
exit;
