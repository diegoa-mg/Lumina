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

$sql = "SELECT usuarios.id, usuarios.nombre, usuarios.correo, roles.nombre AS rol, usuarios.foto_url FROM usuarios JOIN roles ON usuarios.rol_id = roles.id ORDER BY usuarios.nombre ASC";
$resultado = $conexion->query($sql);

if (!$resultado) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'Error al obtener usuarios.']);
    exit;
}

$usuarios = [];
while ($fila = $resultado->fetch_assoc()) {
    $fila['estado'] = 'Activo';
    $usuarios[] = $fila;
}

echo json_encode(['ok' => true, 'usuarios' => $usuarios]);
?>