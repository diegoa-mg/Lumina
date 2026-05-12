<?php

header('Content-Type: application/json');

include 'conexion_bd.php';


// ============================================
// RECIBIR DATOS
// ============================================

$data = json_decode(
    file_get_contents('php://input'),
    true
);


// ============================================
// VALIDAR
// ============================================

if (!$data) {

    echo json_encode([
        'success' => false,
        'error' => 'Datos inválidos'
    ]);

    exit;
}

$post_id = intval($data['post_id'] ?? 0);

$status = trim($data['status'] ?? '');

if (!$post_id || !$status) {

    echo json_encode([
        'success' => false,
        'error' => 'Faltan datos'
    ]);

    exit;
}


// ============================================
// ACTUALIZAR STATUS
// ============================================

$stmt = $conexion->prepare(

    "UPDATE publicaciones
    SET status = ?
    WHERE id = ?"

);

if (!$stmt) {

    echo json_encode([
        'success' => false,
        'error' => $conexion->error
    ]);

    exit;
}

$stmt->bind_param(
    "si",
    $status,
    $post_id
);


// ============================================
// EJECUTAR
// ============================================

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


// ============================================
// CERRAR
// ============================================

$stmt->close();

$conexion->close();

?>