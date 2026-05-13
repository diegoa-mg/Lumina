<?php

header('Content-Type: application/json');

include 'conexion_bd.php';
include 'post_helpers.php';

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

if (!$post_id || !$status) {
    echo json_encode([
        'success' => false,
        'error' => 'Datos incompletos o estado no valido'
    ]);

    exit;
}

if ($status === 'publicado') {
    $stmt = $conexion->prepare(
        "UPDATE publicaciones
        SET status = ?, fecha_publicacion = COALESCE(fecha_publicacion, NOW())
        WHERE id = ?"
    );
} else {
    $stmt = $conexion->prepare(
        "UPDATE publicaciones
        SET status = ?
        WHERE id = ?"
    );
}

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'error' => 'Error SQL: ' . $conexion->error
    ]);

    exit;
}

$stmt->bind_param("si", $status, $post_id);

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
