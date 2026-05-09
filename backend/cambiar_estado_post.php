<?php

header('Content-Type: application/json');

include 'conexion_bd.php';

$data = json_decode(
    file_get_contents('php://input'),
    true
);

$post_id = $data['post_id'];
$status = $data['status'];

$stmt = $conexion->prepare(
    "UPDATE publicaciones
    SET status = ?
    WHERE id = ?"
);

$stmt->bind_param(
    "si",
    $status,
    $post_id
);

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

?>