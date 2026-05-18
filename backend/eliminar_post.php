<?php

header('Content-Type: application/json');

session_start();

include 'conexion_bd.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$post_id  = intval($data['post_id'] ?? 0);
$autor_id = intval($_SESSION['usuario_id']);

if (!$post_id) {
    echo json_encode(['success' => false, 'error' => 'ID inválido']);
    exit;
}

$stmt = $conexion->prepare(
    "SELECT imagen_url FROM publicaciones WHERE id = ? AND autor_id = ?"
);
$stmt->bind_param("ii", $post_id, $autor_id);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$row) {
    echo json_encode(['success' => false, 'error' => 'Post no encontrado']);
    exit;
}

$stmt = $conexion->prepare(
    "DELETE FROM publicaciones WHERE id = ? AND autor_id = ?"
);
$stmt->bind_param("ii", $post_id, $autor_id);

if ($stmt->execute()) {
    if ($row['imagen_url']) {
        $ruta = __DIR__ . '/../frontend/' . $row['imagen_url'];
        if (file_exists($ruta)) {
            @unlink($ruta);
        }
    }
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}

$stmt->close();
$conexion->close();

?>
