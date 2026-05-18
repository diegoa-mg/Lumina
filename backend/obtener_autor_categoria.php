<?php
header('Content-Type: application/json; charset=utf-8');
include 'conexion_bd.php';

$categoria_id = isset($_GET['categoria_id']) ? intval($_GET['categoria_id']) : 0;

if ($categoria_id <= 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'mensaje' => 'Categoría inválida.']);
    exit;
}

$query = "
    SELECT u.id, u.nombre, u.foto_url
    FROM usuarios u
    INNER JOIN autor_categoria ac ON u.id = ac.autor_id
    WHERE ac.categoria_id = ? AND u.rol_id = (SELECT id FROM roles WHERE nombre = 'Autor')
    ORDER BY u.nombre ASC
    LIMIT 1
";

$stmt = $conexion->prepare($query);
$stmt->bind_param('i', $categoria_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $autor = $result->fetch_assoc();
    echo json_encode(['ok' => true, 'autor' => $autor]);
} else {
    echo json_encode(['ok' => true, 'autor' => null]);
}
$stmt->close();
