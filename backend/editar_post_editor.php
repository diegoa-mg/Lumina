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

$rol_stmt = $conexion->prepare("SELECT rol_id FROM usuarios WHERE id = ?");
$rol_stmt->bind_param("i", $usuario_id);
$rol_stmt->execute();
$rol_row = $rol_stmt->get_result()->fetch_assoc();
$rol_stmt->close();

$rol_id = intval($rol_row['rol_id'] ?? 0);

if ($rol_id !== 3 && $rol_id !== 4) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Sin permisos de editor']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
    exit;
}

$post_id     = intval($data['post_id'] ?? 0);
$titulo      = trim($data['titulo'] ?? '');
$descripcion = trim($data['descripcion'] ?? '');
$seccion = normalizar_seccion_publicacion($data['seccion'] ?? 'post');
$categoria_id = $seccion === 'aviso'
    ? 9
    : intval($data['categoria_id'] ?? 1);

$tipos_validos = ['articulo', 'video', 'noticia', 'recurso'];
$tipo_raw = strtolower(trim($data['tipo'] ?? ''));
$tipo = in_array($tipo_raw, $tipos_validos) ? $tipo_raw : 'articulo';
$tipo_aviso = normalizar_tipo_aviso($data['tipo_aviso'] ?? 'academico');
$urgente = !empty($data['urgente']) ? 1 : 0;
$importante = !empty($data['importante']) ? 1 : 0;
$imagen = $data['imagen'] ?? null;

if (!$post_id || $titulo === '' || $descripcion === '') {
    echo json_encode(['success' => false, 'error' => 'Campos incompletos']);
    exit;
}

$stmt_actual = $conexion->prepare("SELECT imagen_url FROM publicaciones WHERE id = ? AND status = 'revision' LIMIT 1");

if (!$stmt_actual) {
    echo json_encode(['success' => false, 'error' => 'Error SQL: ' . $conexion->error]);
    exit;
}

$stmt_actual->bind_param('i', $post_id);
$stmt_actual->execute();
$publicacion_actual = $stmt_actual->get_result()->fetch_assoc();
$stmt_actual->close();

if (!$publicacion_actual) {
    echo json_encode(['success' => false, 'error' => 'Publicacion no encontrada']);
    exit;
}

$imagen_url = $publicacion_actual['imagen_url'] ?? null;

if ($seccion === 'aviso') {
    if ($importante === 1) {
        $resultado_imagen = guardar_imagen_post_base64($imagen, 'aviso_editor_' . $usuario_id);

        if (is_array($resultado_imagen) && empty($resultado_imagen['success'])) {
            echo json_encode($resultado_imagen);
            exit;
        }

        if (is_array($resultado_imagen)) {
            $imagen_url = $resultado_imagen['imagen_url'];
        }

        if (!$imagen_url) {
            echo json_encode(['success' => false, 'error' => 'Los avisos importantes requieren imagen']);
            exit;
        }
    } else {
        $imagen_url = null;
    }
}

$set = ['titulo = ?', 'descripcion = ?', 'categoria_id = ?'];
$tipos_bind = 'ssi';
$valores = [$titulo, $descripcion, $categoria_id];

if (publicaciones_tiene_columna($conexion, 'seccion')) {
    $set[] = 'seccion = ?';
    $tipos_bind .= 's';
    $valores[] = $seccion;
}

if ($seccion === 'aviso') {
    $set[] = 'imagen_url = ?';
    $tipos_bind .= 's';
    $valores[] = $imagen_url;

    if (publicaciones_tiene_columna($conexion, 'tipo_aviso')) {
        $set[] = 'tipo_aviso = ?';
        $tipos_bind .= 's';
        $valores[] = $tipo_aviso;
    }

    if (publicaciones_tiene_columna($conexion, 'urgente')) {
        $set[] = 'urgente = ?';
        $tipos_bind .= 'i';
        $valores[] = $urgente;
    }

    if (publicaciones_tiene_columna($conexion, 'importante')) {
        $set[] = 'importante = ?';
        $tipos_bind .= 'i';
        $valores[] = $importante;
    }
} else {
    if (publicaciones_tiene_columna($conexion, 'tipo')) {
        $set[] = 'tipo = ?';
        $tipos_bind .= 's';
        $valores[] = $tipo;
    }
}

$tipos_bind .= 'i';
$valores[] = $post_id;

$stmt = $conexion->prepare(
    "UPDATE publicaciones
     SET " . implode(', ', $set) . "
     WHERE id = ? AND status = 'revision'"
);

if (!$stmt) {
    echo json_encode(['success' => false, 'error' => 'Error SQL: ' . $conexion->error]);
    exit;
}

$stmt->bind_param($tipos_bind, ...$valores);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}

$stmt->close();
$conexion->close();

?>
