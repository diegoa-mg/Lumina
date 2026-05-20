<?php

header('Content-Type: application/json');

session_start();

include 'conexion_bd.php';
require_once __DIR__ . '/post_helpers.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$post_id  = intval($data['post_id'] ?? 0);
$autor_id = intval($_SESSION['usuario_id']);

if (!$post_id) {
    echo json_encode(['success' => false, 'error' => 'ID inválido']);
    exit;
}

$tiene_video_url = publicaciones_tiene_columna($conexion, 'video_url');
$columnas_archivo = array_values(array_filter(
    ['archivo_url', 'recurso_url', 'noticia_url'],
    static fn($columna) => publicaciones_tiene_columna($conexion, $columna)
));

$select_archivo = $columnas_archivo
    ? "COALESCE(" . implode(", ", $columnas_archivo) . ") AS archivo_url"
    : "NULL AS archivo_url";
$select_video = $tiene_video_url ? "video_url" : "NULL AS video_url";

$stmt = $conexion->prepare(
    "SELECT imagen_url, {$select_video}, {$select_archivo}
    FROM publicaciones
    WHERE id = ? AND autor_id = ?"
);
$stmt->bind_param("ii", $post_id, $autor_id);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$row) {
    echo json_encode(['success' => false, 'error' => 'Post no encontrado']);
    exit;
}

$archivos = array_values(array_filter([
    $row['imagen_url'] ?? '',
    $row['video_url'] ?? '',
    $row['archivo_url'] ?? ''
], static function ($ruta) {
    return is_string($ruta) && trim($ruta) !== '';
}));

$conexion->begin_transaction();

try {
    $stmt = $conexion->prepare("DELETE FROM reacciones WHERE elemento_id = ?");
    if (!$stmt) {
        throw new Exception($conexion->error);
    }
    $stmt->bind_param("i", $post_id);
    if (!$stmt->execute()) {
        throw new Exception($stmt->error);
    }
    $stmt->close();

    $stmt = $conexion->prepare(
        "DELETE FROM publicaciones WHERE id = ? AND autor_id = ?"
    );
    if (!$stmt) {
        throw new Exception($conexion->error);
    }
    $stmt->bind_param("ii", $post_id, $autor_id);
    if (!$stmt->execute()) {
        throw new Exception($stmt->error);
    }
    $stmt->close();

    $conexion->commit();

    $archivos_eliminados = 0;
    foreach (array_unique($archivos) as $archivo) {
        if (eliminar_archivo_frontend($archivo)) {
            $archivos_eliminados++;
        }
    }

    echo json_encode([
        'success' => true,
        'archivos_eliminados' => $archivos_eliminados
    ]);
} catch (Throwable $error) {
    $conexion->rollback();
    echo json_encode([
        'success' => false,
        'error' => $error->getMessage() ?: 'No se pudo eliminar el post'
    ]);
}

$conexion->close();

?>
