<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

include 'conexion_bd.php';

// 1. Verificar sesión activa
if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No hay una sesión activa.']);
    exit;
}

$usuario_id = (int) $_SESSION['usuario_id'];

// 2. Verificar que el usuario sea Administrador (rol_id = 4)
$rol_stmt = $conexion->prepare('SELECT rol_id FROM usuarios WHERE id = ?');
$rol_stmt->bind_param('i', $usuario_id);
$rol_stmt->execute();
$rol_row = $rol_stmt->get_result()->fetch_assoc();
$rol_stmt->close();

$rol_id = intval($rol_row['rol_id'] ?? 0);
if ($rol_id !== 4) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'No tienes permisos de administrador.']);
    exit;
}

// 3. Obtener conteo de publicaciones creadas
$resPublicaciones = $conexion->query("SELECT COUNT(*) as total FROM publicaciones");
$totalPublicaciones = $resPublicaciones->fetch_assoc()['total'] ?? 0;

// 4. Obtener conteo de usuarios totales
$resUsuarios = $conexion->query("SELECT COUNT(*) as total FROM usuarios");
$totalUsuarios = $resUsuarios->fetch_assoc()['total'] ?? 0;

// 5. Obtener conteo de usuarios desglosados por rol
$sqlRoles = "
    SELECT r.id, r.nombre, COUNT(u.id) as cantidad 
    FROM roles r 
    LEFT JOIN usuarios u ON r.id = u.rol_id 
    GROUP BY r.id, r.nombre
";
$resRoles = $conexion->query($sqlRoles);
$rolesConteo = [];

while ($row = $resRoles->fetch_assoc()) {
    $rolesConteo[] = [
        'rol_id' => (int) $row['id'],
        'nombre' => $row['nombre'],
        'cantidad' => (int) $row['cantidad']
    ];
}

// 6. Enviar respuesta consolidada
echo json_encode([
    'success' => true,
    'data' => [
        'total_publicaciones' => (int) $totalPublicaciones,
        'total_usuarios' => (int) $totalUsuarios,
        'roles' => $rolesConteo
    ]
]);

$conexion->close();
?>