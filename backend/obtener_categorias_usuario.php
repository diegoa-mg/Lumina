<?php
header('Content-Type: application/json; charset=utf-8');
include 'conexion_bd.php';

$usuario_id = isset($_GET['usuario_id']) ? intval($_GET['usuario_id']) : 0;

if ($usuario_id <= 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'mensaje' => 'Usuario inválido.']);
    exit;
}

$query = "
    SELECT c.id, c.nombre_categoria
    FROM categorias c
    INNER JOIN autor_categoria ac ON c.id = ac.categoria_id
    WHERE ac.autor_id = ?
    ORDER BY c.nombre_categoria ASC
";

$stmt = $conexion->prepare($query);
$stmt->bind_param('i', $usuario_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result) {
    $categorias = [];
    while ($row = $result->fetch_assoc()) {
        $categorias[] = $row;
    }
    echo json_encode(['ok' => true, 'categorias' => $categorias]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'Error al obtener categorías del usuario.']);
}
$stmt->close();
