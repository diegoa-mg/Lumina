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
$seccion     = normalizar_seccion_publicacion($data['seccion'] ?? 'post');
$imagen      = $data['imagen'] ?? null;

if (!$post_id || $titulo === '' || $descripcion === '') {
    echo json_encode(['success' => false, 'error' => 'Campos incompletos']);
    exit;
}

// Se construye el UPDATE segun el tipo de publicacion (post o aviso).
$set = ['titulo = ?', 'descripcion = ?'];
$tipos_bind = 'ss';
$valores = [$titulo, $descripcion];

if ($seccion === 'aviso') {
    $tipo_aviso = normalizar_tipo_aviso($data['tipo_aviso'] ?? 'academico');
    $urgente    = normalizar_booleano($data['urgente'] ?? 0);
    $importante = normalizar_booleano($data['importante'] ?? 0);
    $imagen_url = null;

    $imagen_stmt = $conexion->prepare("SELECT imagen_url FROM publicaciones WHERE id = ? AND status = 'revision'");
    if (!$imagen_stmt) {
        echo json_encode(['success' => false, 'error' => 'Error SQL: ' . $conexion->error]);
        exit;
    }

    $imagen_stmt->bind_param('i', $post_id);
    $imagen_stmt->execute();
    $imagen_row = $imagen_stmt->get_result()->fetch_assoc();
    $imagen_stmt->close();

    if (!$imagen_row) {
        echo json_encode(['success' => false, 'error' => 'Post no encontrado']);
        exit;
    }

    $imagen_url = $imagen_row['imagen_url'] ?? null;
    $resultado_imagen = guardar_imagen_post_base64($imagen, 'aviso_editor_' . $usuario_id);

    if (is_array($resultado_imagen) && empty($resultado_imagen['success'])) {
        echo json_encode($resultado_imagen);
        exit;
    }

    if (is_array($resultado_imagen)) {
        $imagen_url = $resultado_imagen['imagen_url'];
    }

    if ($importante === 1 && !$imagen_url) {
        echo json_encode(['success' => false, 'error' => 'Los avisos importantes requieren imagen']);
        exit;
    }

    if (publicaciones_tiene_columna($conexion, 'seccion')) {
        $set[] = 'seccion = ?';
        $tipos_bind .= 's';
        $valores[] = 'aviso';
    }
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
    $set[] = 'imagen_url = ?';
    $tipos_bind .= 's';
    $valores[] = $imagen_url;
} else {
    $tipo = normalizar_tipo_post($data['tipo'] ?? 'articulo');
    $categoria_id = intval($data['categoria_id'] ?? 1);

    $set[] = 'categoria_id = ?';
    $tipos_bind .= 'i';
    $valores[] = $categoria_id;

    if (publicaciones_tiene_columna($conexion, 'tipo')) {
        $set[] = 'tipo = ?';
        $tipos_bind .= 's';
        $valores[] = $tipo;
    }
}

$tipos_bind .= 'i';
$valores[] = $post_id;

$sql = "UPDATE publicaciones
        SET " . implode(', ', $set) . "
        WHERE id = ? AND status = 'revision'";

$stmt = $conexion->prepare($sql);

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
