<?php
header('Content-Type: application/json');
session_start();
include 'conexion_bd.php';

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$post_id = $data['post_id'] ?? null;
$nuevo_status = $data['status'] ?? 'revision';

if ($post_id) {
    $stmt = $conexion->prepare("UPDATE publicaciones SET status = ? WHERE id = ? AND autor_id = ?");
    $stmt->bind_param("sii", $nuevo_status, $post_id, $_SESSION['usuario_id']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conexion->error]);
    }
    $stmt->close();
}
$conexion->close();
?>