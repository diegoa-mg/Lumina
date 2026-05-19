<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

include 'conexion_bd.php';

// Verificar permisos de Administrador
if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No hay una sesión activa.']);
    exit;
}

$usuario_id = (int) $_SESSION['usuario_id'];
$rol_stmt = $conexion->prepare('SELECT rol_id FROM usuarios WHERE id = ?');
$rol_stmt->bind_param('i', $usuario_id);
$rol_stmt->execute();
$rol_id = intval($rol_stmt->get_result()->fetch_assoc()['rol_id'] ?? 0);
$rol_stmt->close();

if ($rol_id !== 4) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso denegado.']);
    exit;
}

$datos = json_decode(file_get_contents('php://input'), true);
$categoria_id = isset($datos['id']) ? (int)$datos['id'] : 0;

if (!$categoria_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'ID de categoría no válido.']);
    exit;
}

// Proceder con la eliminación
$sql = "DELETE FROM categorias WHERE id = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param('i', $categoria_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'mensaje' => 'Categoría eliminada correctamente.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No se pudo eliminar la categoría.']);
}

$stmt->close();
$conexion->close();
?>