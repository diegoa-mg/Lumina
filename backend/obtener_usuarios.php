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

$sql = "
    SELECT
        usuarios.id,
        usuarios.nombre,
        usuarios.correo,
        roles.nombre AS rol,
        usuarios.foto_url,
        GROUP_CONCAT(categorias.id ORDER BY categorias.nombre_categoria SEPARATOR ',') AS categorias_ids,
        GROUP_CONCAT(categorias.nombre_categoria ORDER BY categorias.nombre_categoria SEPARATOR ', ') AS categorias_nombres
    FROM usuarios
    JOIN roles ON usuarios.rol_id = roles.id
    LEFT JOIN autor_categoria ON autor_categoria.autor_id = usuarios.id
    LEFT JOIN categorias ON categorias.id = autor_categoria.categoria_id
    GROUP BY usuarios.id, usuarios.nombre, usuarios.correo, roles.nombre, usuarios.foto_url
    ORDER BY usuarios.nombre ASC
";
$resultado = $conexion->query($sql);

if (!$resultado) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'Error al obtener usuarios.']);
    exit;
}

$usuarios = [];
while ($fila = $resultado->fetch_assoc()) {
    $fila['estado'] = 'Activo';
    $fila['categorias'] = [];
    if (!empty($fila['categorias_ids'])) {
        $ids = explode(',', $fila['categorias_ids']);
        $nombres = explode(', ', $fila['categorias_nombres'] ?? '');
        foreach ($ids as $index => $catId) {
            $fila['categorias'][] = [
                'id' => intval($catId),
                'nombre_categoria' => $nombres[$index] ?? ''
            ];
        }
    }
    $usuarios[] = $fila;
}

echo json_encode(['ok' => true, 'usuarios' => $usuarios]);
?>
