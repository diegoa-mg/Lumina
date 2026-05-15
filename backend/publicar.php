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
$seccion = normalizar_seccion_publicacion($data['seccion'] ?? 'post');
$tipo = normalizar_tipo_post($data['tipo'] ?? 'articulo');
$categoria_id = $seccion === 'aviso'
    ? 9
    : obtener_categoria_post_desde_data($data);
$tipo_aviso = normalizar_tipo_aviso($data['tipo_aviso'] ?? 'academico');
$urgente = normalizar_urgente_aviso($data['urgente'] ?? false);
$importante = normalizar_importante_post($data['importante'] ?? false, $seccion);
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

if ($seccion === 'aviso' && $importante && empty($data['imagen'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Los avisos importantes requieren una imagen adjunta'
    ]);

    exit;
}

$autor_id = intval($_SESSION['usuario_id']);
$imagen_url = null;

$resultado_imagen = null;

if ($seccion !== 'aviso' || $importante) {
    $resultado_imagen = guardar_imagen_post_base64(
        $data['imagen'] ?? null,
        'post_' . $autor_id
    );
}

if (is_array($resultado_imagen) && empty($resultado_imagen['success'])) {
    echo json_encode($resultado_imagen);
    exit;
}

if (is_array($resultado_imagen)) {
    $imagen_url = $resultado_imagen['imagen_url'];
}

$tiene_tipo = publicaciones_tiene_columna($conexion, 'tipo');
$tiene_seccion = publicaciones_tiene_columna($conexion, 'seccion');
$tiene_tipo_aviso = publicaciones_tiene_columna($conexion, 'tipo_aviso');
$tiene_urgente = publicaciones_tiene_columna($conexion, 'urgente');
$tiene_importante = publicaciones_tiene_columna($conexion, 'importante');

$columnas = ['titulo', 'descripcion', 'imagen_url', 'categoria_id', 'status', 'autor_id'];
$placeholders = ['?', '?', '?', '?', '?', '?'];
$types = 'sssisi';
$valores = [
    &$titulo,
    &$descripcion,
    &$imagen_url,
    &$categoria_id,
    &$status,
    &$autor_id
];

if ($tiene_tipo) {
    $columnas[] = 'tipo';
    $placeholders[] = '?';
    $types .= 's';
    $valores[] = &$tipo;
}

if ($tiene_seccion) {
    $columnas[] = 'seccion';
    $placeholders[] = '?';
    $types .= 's';
    $valores[] = &$seccion;
}

if ($tiene_tipo_aviso) {
    $columnas[] = 'tipo_aviso';
    $placeholders[] = '?';
    $types .= 's';
    $valores[] = &$tipo_aviso;
}

if ($tiene_urgente) {
    $columnas[] = 'urgente';
    $placeholders[] = '?';
    $types .= 'i';
    $valores[] = &$urgente;
}

if ($tiene_importante) {
    $columnas[] = 'importante';
    $placeholders[] = '?';
    $types .= 'i';
    $valores[] = &$importante;
}

$stmt = $conexion->prepare(
    "INSERT INTO publicaciones (" . implode(', ', $columnas) . ")
    VALUES (" . implode(', ', $placeholders) . ")"
);

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'error' => 'Error SQL: ' . $conexion->error
    ]);

    exit;
}

$stmt->bind_param($types, ...$valores);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'post_id' => $conexion->insert_id,
        'imagen_url' => $imagen_url,
        'tipo' => $tipo,
        'seccion' => $seccion,
        'tipo_aviso' => $tipo_aviso,
        'urgente' => $urgente,
        'importante' => $importante,
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
