<?php

header('Content-Type: application/json');
session_start();

include 'conexion_bd.php';
include 'comentarios_materia_helpers.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Debes iniciar sesion para comentar']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    $data = $_POST;
}

$categoria_id = intval($data['categoria_id'] ?? 0);
$comentario = trim($data['comentario'] ?? '');
$usuario_id = intval($_SESSION['usuario_id']);

try {
    if (!asegurar_tabla_comentarios_materia($conexion)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'No se pudo preparar la tabla de comentarios']);
        exit;
    }
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No se pudo preparar la tabla de comentarios']);
    exit;
}

if ($categoria_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Materia invalida']);
    exit;
}

if ($comentario === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Escribe un comentario']);
    exit;
}

$longitud_comentario = function_exists('mb_strlen')
    ? mb_strlen($comentario, 'UTF-8')
    : strlen($comentario);

if ($longitud_comentario > 1000) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'El comentario es demasiado largo']);
    exit;
}

$stmt_categoria = $conexion->prepare("SELECT id FROM categorias WHERE id = ? LIMIT 1");
if (!$stmt_categoria) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error SQL']);
    exit;
}

$stmt_categoria->bind_param('i', $categoria_id);
$stmt_categoria->execute();
$existe_categoria = $stmt_categoria->get_result()->num_rows > 0;
$stmt_categoria->close();

if (!$existe_categoria) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Materia no encontrada']);
    exit;
}

$stmt = $conexion->prepare("
    INSERT INTO comentarios_materia (categoria_id, usuario_id, comentario)
    VALUES (?, ?, ?)
");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error SQL']);
    exit;
}

$stmt->bind_param('iis', $categoria_id, $usuario_id, $comentario);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No se pudo publicar el comentario']);
    exit;
}

$comentario_id = $conexion->insert_id;
$stmt->close();

$stmt_comentario = $conexion->prepare("
    SELECT
        comentarios_materia.id,
        comentarios_materia.comentario,
        comentarios_materia.fecha_creacion,
        usuarios.nombre,
        usuarios.foto_url
    FROM comentarios_materia
    INNER JOIN usuarios
    ON usuarios.id = comentarios_materia.usuario_id
    WHERE comentarios_materia.id = ?
    LIMIT 1
");
$stmt_comentario->bind_param('i', $comentario_id);
$stmt_comentario->execute();
$comentario_guardado = $stmt_comentario->get_result()->fetch_assoc();
$stmt_comentario->close();

echo json_encode([
    'success' => true,
    'comentario' => $comentario_guardado
]);

$conexion->close();

?>
