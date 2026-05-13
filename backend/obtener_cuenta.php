<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

include 'conexion_bd.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'No hay una sesion activa.'
    ]);
    exit;
}

$usuario_id = (int) $_SESSION['usuario_id'];
$stmt = $conexion->prepare('SELECT nombre, usuarios, correo, password FROM usuarios WHERE id = ? LIMIT 1');
$stmt->bind_param('i', $usuario_id);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {
    http_response_code(404);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'Usuario no encontrado.'
    ]);
    exit;
}

$usuario = $resultado->fetch_assoc();

echo json_encode([
    'ok' => true,
    'usuario' => [
        'nombre' => $usuario['nombre'],
        'usuario' => $usuario['usuarios'],
        'correo' => $usuario['correo'],
        'tiene_password' => !empty($usuario['password'])
    ]
]);
