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

// ============================================
// DATOS
// ============================================

$titulo = trim($data['titulo'] ?? '');

$descripcion = trim($data['descripcion'] ?? '');

$tipo = normalizar_tipo_post(
    $data['tipo'] ?? 'articulo'
);

$categoria_id = obtener_categoria_post_desde_data($data);

$status = normalizar_status_post(
    $data['status'] ?? 'borrador'
);

$youtube_url = trim(
    $data['youtube_url'] ?? ''
);

$noticia_url = trim(
    $data['noticia_url'] ?? ''
);

// ============================================
// VALIDACIONES
// ============================================

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

// Validar YouTube si es video
if ($tipo === 'video' && $youtube_url === '') {

    echo json_encode([
        'success' => false,
        'error' => 'Debes agregar un link de YouTube'
    ]);

    exit;
}

// Validar noticia si es noticia
if ($tipo === 'noticia' && $noticia_url === '') {

    echo json_encode([
        'success' => false,
        'error' => 'Debes agregar un link de noticia'
    ]);

    exit;
}

$autor_id = intval($_SESSION['usuario_id']);

$imagen_url = null;

// ============================================
// GUARDAR IMAGEN
// ============================================

$resultado_imagen = guardar_imagen_post_base64(
    $data['imagen'] ?? null,
    'post_' . $autor_id
);

if (
    is_array($resultado_imagen)
    && empty($resultado_imagen['success'])
) {

    echo json_encode($resultado_imagen);

    exit;
}

if (is_array($resultado_imagen)) {

    $imagen_url = $resultado_imagen['imagen_url'];
}

// ============================================
// VERIFICAR COLUMNA TIPO
// ============================================

$tiene_tipo = publicaciones_tiene_columna(
    $conexion,
    'tipo'
);

// ============================================
// INSERT
// ============================================

if ($tiene_tipo) {

    $stmt = $conexion->prepare(
        "INSERT INTO publicaciones
        (
            titulo,
            descripcion,
            imagen_url,
            tipo,
            categoria_id,
            status,
            autor_id,
            youtube_url,
            noticia_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );

} else {

    $stmt = $conexion->prepare(
        "INSERT INTO publicaciones
        (
            titulo,
            descripcion,
            imagen_url,
            categoria_id,
            status,
            autor_id,
            youtube_url,
            noticia_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
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

// ============================================
// BIND PARAMS
// ============================================

if ($tiene_tipo) {

    $stmt->bind_param(
        "ssssisiss",
        $titulo,
        $descripcion,
        $imagen_url,
        $tipo,
        $categoria_id,
        $status,
        $autor_id,
        $youtube_url,
        $noticia_url
    );

} else {

    $stmt->bind_param(
        "sssisiss",
        $titulo,
        $descripcion,
        $imagen_url,
        $categoria_id,
        $status,
        $autor_id,
        $youtube_url,
        $noticia_url
    );
}

// ============================================
// EJECUTAR
// ============================================

if ($stmt->execute()) {

    echo json_encode([

        'success' => true,

        'post_id' => $conexion->insert_id,

        'imagen_url' => $imagen_url,

        'tipo' => $tipo,

        'categoria_id' => $categoria_id,

        'status' => $status,

        'youtube_url' => $youtube_url,

        'noticia_url' => $noticia_url,

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