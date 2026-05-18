<?php
header('Content-Type: application/json; charset=utf-8');
include 'conexion_bd.php';

$query = "SELECT id, nombre_categoria FROM categorias ORDER BY nombre_categoria ASC";
$result = $conexion->query($query);

if ($result) {
    $categorias = [];
    while ($row = $result->fetch_assoc()) {
        $categorias[] = $row;
    }
    echo json_encode(['ok' => true, 'categorias' => $categorias]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'Error al obtener categorías.']);
}
