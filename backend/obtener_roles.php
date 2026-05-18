<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

include 'conexion_bd.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'mensaje' => 'No hay sesión activa.']);
    exit;
}

$rolSesion = $_SESSION['rol'] ?? '';
if (strtolower($rolSesion) !== 'administrador') {
    http_response_code(403);
    echo json_encode(['ok' => false, 'mensaje' => 'Acceso denegado.']);
    exit;
}

$sql = "SELECT id, nombre FROM roles ORDER BY id ASC";
$resultado = $conexion->query($sql);

if (!$resultado) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'Error al obtener roles.']);
    exit;
}

$roles = [];
while ($fila = $resultado->fetch_assoc()) {
    $roles[] = $fila;
}

echo json_encode(['ok' => true, 'roles' => $roles]);
