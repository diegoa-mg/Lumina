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
$rol_stmt->bind_param("i", $usuario_id);
$rol_stmt->execute();
$rol_row = $rol_stmt->get_result()->fetch_assoc();
$rol_stmt->close();

$rol_id = intval($rol_row['rol_id'] ?? 0);

if ($rol_id !== 3 && $rol_id !== 4) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Sin permisos de editor']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
    exit;
}

$post_id     = intval($data['post_id'] ?? 0);
$titulo      = trim($data['titulo'] ?? '');
$descripcion = trim($data['descripcion'] ?? '');
$categoria_id = intval($data['categoria_id'] ?? 1);

$tipos_validos = ['articulo', 'video', 'noticia', 'recurso'];
$tipo_raw = strtolower(trim($data['tipo'] ?? ''));
$tipo = in_array($tipo_raw, $tipos_validos) ? $tipo_raw : 'articulo';

if (!$post_id || $titulo === '' || $descripcion === '') {
    echo json_encode(['success' => false, 'error' => 'Campos incompletos']);
    exit;
}

$stmt = $conexion->prepare(
    "UPDATE publicaciones
     SET titulo = ?, descripcion = ?, tipo = ?, categoria_id = ?
     WHERE id = ? AND status = 'revision'"
);

if (!$stmt) {
    echo json_encode(['success' => false, 'error' => 'Error SQL: ' . $conexion->error]);
    exit;
}

$stmt->bind_param("sssii", $titulo, $descripcion, $tipo, $categoria_id, $post_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}

$stmt->close();
$conexion->close();

?>
