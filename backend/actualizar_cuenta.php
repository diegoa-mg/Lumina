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

$datos = json_decode(file_get_contents('php://input'), true);
$campo = $datos['campo'] ?? '';
$valor = trim($datos['valor'] ?? '');
$usuario_id = (int) $_SESSION['usuario_id'];

if ($valor === '') {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'Debes agregar informacion para guardar cambios.'
    ]);
    exit;
}

$columnasPermitidas = [
    'nombre' => 'nombre',
    'usuario' => 'usuarios',
    'correo' => 'correo',
    'password' => 'password'
];

if (!isset($columnasPermitidas[$campo])) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'Campo no valido.'
    ]);
    exit;
}

if ($campo === 'correo' && !filter_var($valor, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'Ingresa un correo valido.'
    ]);
    exit;
}

if ($campo === 'correo' || $campo === 'usuario') {
    $columnaDuplicada = $columnasPermitidas[$campo];
    $sqlDuplicado = "SELECT id FROM usuarios WHERE $columnaDuplicada = ? AND id <> ? LIMIT 1";
    $stmtDuplicado = $conexion->prepare($sqlDuplicado);
    $stmtDuplicado->bind_param('si', $valor, $usuario_id);
    $stmtDuplicado->execute();
    $resultadoDuplicado = $stmtDuplicado->get_result();

    if ($resultadoDuplicado->num_rows > 0) {
        http_response_code(409);
        echo json_encode([
            'ok' => false,
            'mensaje' => $campo === 'correo' ? 'Ese correo ya esta en uso.' : 'Ese usuario ya esta en uso.'
        ]);
        exit;
    }
}

if ($campo === 'password') {
    $valor = password_hash($valor, PASSWORD_DEFAULT);
}

$columna = $columnasPermitidas[$campo];
$sql = "UPDATE usuarios SET $columna = ? WHERE id = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param('si', $valor, $usuario_id);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'No se pudo actualizar la informacion.'
    ]);
    exit;
}

if ($campo === 'usuario') {
    $_SESSION['usuario'] = $datos['valor'];
}

echo json_encode([
    'ok' => true,
    'mensaje' => 'Informacion actualizada correctamente.'
]);
