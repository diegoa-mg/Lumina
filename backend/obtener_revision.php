<?php

header('Content-Type: application/json');

session_start();
include 'conexion_bd.php';
include 'post_helpers.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

$usuario_id = intval($_SESSION['usuario_id']);
$rol_stmt = $conexion->prepare('SELECT rol_id FROM usuarios WHERE id = ?');
$rol_stmt->bind_param('i', $usuario_id);
$rol_stmt->execute();
$rol_row = $rol_stmt->get_result()->fetch_assoc();
$rol_stmt->close();

$rol_id = intval($rol_row['rol_id'] ?? 0);
if ($rol_id !== 3 && $rol_id !== 4) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Sin permisos de editor']);
    exit;
}

$tipo_select = publicaciones_tiene_columna($conexion, 'tipo')
    ? "publicaciones.tipo"
    : "'articulo' AS tipo";
$tiene_seccion = publicaciones_tiene_columna($conexion, 'seccion');
$seccion_select = $tiene_seccion
    ? "publicaciones.seccion"
    : "'post' AS seccion";
$materia_select = $tiene_seccion
    ? "CASE WHEN publicaciones.seccion = 'aviso' OR publicaciones.categoria_id = 9 THEN NULL ELSE categorias.nombre_categoria END AS materia"
    : "CASE WHEN publicaciones.categoria_id = 9 THEN NULL ELSE categorias.nombre_categoria END AS materia";
$tipo_aviso_select = publicaciones_tiene_columna($conexion, 'tipo_aviso')
    ? "publicaciones.tipo_aviso"
    : "'academico' AS tipo_aviso";
$urgente_select = publicaciones_tiene_columna($conexion, 'urgente')
    ? "publicaciones.urgente"
    : "0 AS urgente";
$importante_select = publicaciones_tiene_columna($conexion, 'importante')
    ? "publicaciones.importante"
    : "0 AS importante";

$sql = "
SELECT
    publicaciones.id,
    publicaciones.titulo,
    publicaciones.descripcion,
    publicaciones.imagen_url,
    publicaciones.status,
    $tipo_select,
    $seccion_select,
    $tipo_aviso_select,
    $urgente_select,
    $importante_select,
    publicaciones.categoria_id,
    $materia_select,
    publicaciones.fecha_creacion,
    usuarios.nombre AS autor
FROM publicaciones
LEFT JOIN categorias
ON publicaciones.categoria_id = categorias.id
LEFT JOIN usuarios
ON publicaciones.autor_id = usuarios.id
WHERE publicaciones.status = 'revision'
ORDER BY publicaciones.fecha_creacion DESC
";

$resultado = $conexion->query($sql);
$posts = [];

if ($resultado) {
    while ($fila = $resultado->fetch_assoc()) {
        $posts[] = $fila;
    }
}

echo json_encode($posts);

$conexion->close();

?>
