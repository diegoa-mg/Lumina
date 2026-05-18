<?php

header('Content-Type: application/json');

session_start();
include 'conexion_bd.php';
include 'post_helpers.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'No autorizado'
    ]);
    exit;
}

$user_id = intval($_SESSION['usuario_id']);

$rol_stmt = $conexion->prepare('SELECT rol_id FROM usuarios WHERE id = ?');
$rol_stmt->bind_param('i', $user_id);
$rol_stmt->execute();
$rol_row = $rol_stmt->get_result()->fetch_assoc();
$rol_stmt->close();

$rol_id = intval($rol_row['rol_id'] ?? 0);
$is_editor = in_array($rol_id, [3, 4], true);

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode([
        'success' => false,
        'error' => 'Datos invalidos'
    ]);

    exit;
}

$post_id = intval($data['post_id'] ?? 0);
$status = normalizar_status_post($data['status'] ?? '');
$observaciones = trim($data['observaciones'] ?? '');

if (!$post_id || !$status) {
    echo json_encode([
        'success' => false,
        'error' => 'Datos incompletos o estado no valido'
    ]);

    exit;
}

$post_stmt = $conexion->prepare('SELECT autor_id, status FROM publicaciones WHERE id = ?');
$post_stmt->bind_param('i', $post_id);
$post_stmt->execute();
$post_result = $post_stmt->get_result();
$post_data = $post_result ? $post_result->fetch_assoc() : null;
$post_stmt->close();

if (!$post_data) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'Publicación no encontrada'
    ]);

    exit;
}

$autor_id = intval($post_data['autor_id']);

if ($status === 'revision') {
    if ($autor_id !== $user_id && !$is_editor) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'Sin permisos para enviar a revisión'
        ]);

        exit;
    }
}

if ($status === 'publicado' || $status === 'rechazado') {
    if (!$is_editor) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'Sin permisos de editor'
        ]);

        exit;
    }
}

$hasObservaciones = publicaciones_tiene_columna($conexion, 'observaciones_editor');

if ($status === 'publicado') {
    $sql = 'UPDATE publicaciones SET status = ?, fecha_publicacion = COALESCE(fecha_publicacion, NOW())';
    if ($hasObservaciones) {
        $sql .= ', observaciones_editor = NULL';
    }
    $sql .= ' WHERE id = ?';
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param('si', $status, $post_id);
} elseif ($status === 'rechazado') {
    $sql = 'UPDATE publicaciones SET status = ?';
    if ($hasObservaciones) {
        $sql .= ', observaciones_editor = ?';
    }
    $sql .= ' WHERE id = ?';
    if ($hasObservaciones) {
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param('ssi', $status, $observaciones, $post_id);
    } else {
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param('si', $status, $post_id);
    }
} else {
    $sql = 'UPDATE publicaciones SET status = ?';
    if ($hasObservaciones) {
        $sql .= ', observaciones_editor = NULL';
    }
    $sql .= ' WHERE id = ?';
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param('si', $status, $post_id);
}

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'error' => 'Error SQL: ' . $conexion->error
    ]);

    exit;
}

if ($stmt->execute()) {
    echo json_encode([
        'success' => true
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => $stmt->error
    ]);
}

$stmt->close();
$conexion->close();

?>
