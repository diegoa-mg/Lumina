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

$sql = "SELECT u.id, u.nombre, u.usuarios, u.correo, u.foto_url, r.nombre AS rol
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        ORDER BY u.nombre ASC";

$resultado = $conexion->query($sql);

if (!$resultado) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'Error al obtener usuarios.']);
    exit;
}

$usuarios = [];
while ($fila = $resultado->fetch_assoc()) {
    $usuarios[] = $fila;
}

echo json_encode(['ok' => true, 'usuarios' => $usuarios]);
?>