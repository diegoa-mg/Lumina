<?php
// backend/publicar.php

header('Content-Type: application/json');

session_start();

include 'conexion_bd.php';
include 'post_helpers.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);

    echo json_encode([
        'success' => false,
        'error' => 'No autorizado'
    ]);

    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode([
        'success' => false,
        'error' => 'Datos invalidos'
    ]);

    exit;
}

$titulo = trim($data['titulo'] ?? '');
$descripcion = trim($data['descripcion'] ?? '');
$tipo = normalizar_tipo_post($data['tipo'] ?? 'articulo');
$categoria_id = obtener_categoria_post_desde_data($data);
$status = normalizar_status_post($data['status'] ?? 'borrador');

if (!$status) {
    echo json_encode([
        'success' => false,
        'error' => 'Estado de publicacion no valido'
    ]);

    exit;
}

if ($titulo === '' || $descripcion === '') {
    echo json_encode([
        'success' => false,
        'error' => 'Titulo y descripcion son obligatorios'
    ]);

    exit;
}

$autor_id = intval($_SESSION['usuario_id']);
$imagen_url = null;

$resultado_imagen = guardar_imagen_post_base64(
    $data['imagen'] ?? null,
    'post_' . $autor_id
);

if (is_array($resultado_imagen) && empty($resultado_imagen['success'])) {
    echo json_encode($resultado_imagen);
    exit;
}

if (is_array($resultado_imagen)) {
    $imagen_url = $resultado_imagen['imagen_url'];
}

$tiene_tipo = publicaciones_tiene_columna($conexion, 'tipo');

if ($tiene_tipo) {
    $stmt = $conexion->prepare(
        "INSERT INTO publicaciones
        (titulo, descripcion, imagen_url, tipo, categoria_id, status, autor_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
} else {
    $stmt = $conexion->prepare(
        "INSERT INTO publicaciones
        (titulo, descripcion, imagen_url, categoria_id, status, autor_id)
        VALUES (?, ?, ?, ?, ?, ?)"
    );
}

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'error' => 'Error SQL: ' . $conexion->error
    ]);

    exit;
}

if ($tiene_tipo) {
    $stmt->bind_param(
        "ssssisi",
        $titulo,
        $descripcion,
        $imagen_url,
        $tipo,
        $categoria_id,
        $status,
        $autor_id
    );
} else {
    $stmt->bind_param(
        "sssisi",
        $titulo,
        $descripcion,
        $imagen_url,
        $categoria_id,
        $status,
        $autor_id
    );
}

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'post_id' => $conexion->insert_id,
        'imagen_url' => $imagen_url,
        'tipo' => $tipo,
        'categoria_id' => $categoria_id,
        'status' => $status,
        'mensaje' => 'Publicacion creada correctamente'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Error al guardar: ' . $stmt->error
    ]);
}

$stmt->close();
$conexion->close();

?>
