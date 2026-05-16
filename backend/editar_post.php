<?php

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

$data = json_decode(file_get_contents("php://input"), true);

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

$post_id = intval(
    $data['post_id'] ?? 0
);

$autor_id = intval(
    $_SESSION['usuario_id']
);

$titulo = trim(
    $data['titulo'] ?? ''
);

$descripcion = trim(
    $data['descripcion'] ?? ''
);

$tipo = normalizar_tipo_post(
    $data['tipo'] ?? 'articulo'
);

$categoria_id = obtener_categoria_post_desde_data(
    $data
);

$imagen = $data['imagen'] ?? null;

$youtube_url = trim(
    $data['youtube_url'] ?? ''
);

$noticia_url = trim(
    $data['noticia_url'] ?? ''
);

// ============================================
// VALIDACIONES
// ============================================

if (
    !$post_id
    || $titulo === ''
    || $descripcion === ''
) {

    echo json_encode([
        'success' => false,
        'error' => 'Campos incompletos'
    ]);

    exit;
}

// Validar YouTube
if (
    $tipo === 'video'
    && $youtube_url === ''
) {

    echo json_encode([
        'success' => false,
        'error' => 'Debes agregar un link de YouTube'
    ]);

    exit;
}

// Validar noticia
if (
    $tipo === 'noticia'
    && $noticia_url === ''
) {

    echo json_encode([
        'success' => false,
        'error' => 'Debes agregar un link de noticia'
    ]);

    exit;
}

// ============================================
// OBTENER POST
// ============================================

$stmt = $conexion->prepare(
    "SELECT imagen_url
    FROM publicaciones
    WHERE id = ? AND autor_id = ?"
);

if (!$stmt) {

    echo json_encode([
        'success' => false,
        'error' => 'Error SQL: ' . $conexion->error
    ]);

    exit;
}

$stmt->bind_param(
    "ii",
    $post_id,
    $autor_id
);

$stmt->execute();

$resultado = $stmt->get_result();

$post = $resultado->fetch_assoc();

$stmt->close();

if (!$post) {

    echo json_encode([
        'success' => false,
        'error' => 'Post no encontrado'
    ]);

    exit;
}

// ============================================
// IMAGEN
// ============================================

$imagen_url = $post['imagen_url'];

$resultado_imagen = null;

if ($seccion !== 'aviso' || $importante) {
    $resultado_imagen = guardar_imagen_post_base64(
        $imagen,
        'post_' . $autor_id
    );
}

if (
    is_array($resultado_imagen)
    && empty($resultado_imagen['success'])
) {

    echo json_encode($resultado_imagen);

    exit;
}

if (is_array($resultado_imagen)) {

    $imagen_url =
        $resultado_imagen['imagen_url'];
}

// ============================================
// VERIFICAR COLUMNA TIPO
// ============================================

$tiene_tipo = publicaciones_tiene_columna(
    $conexion,
    'tipo'
);

// ============================================
// UPDATE
// ============================================

if ($tiene_tipo) {

    $stmt = $conexion->prepare(
        "UPDATE publicaciones
        SET titulo = ?,
            descripcion = ?,
            tipo = ?,
            categoria_id = ?,
            imagen_url = ?,
            youtube_url = ?,
            noticia_url = ?
        WHERE id = ? AND autor_id = ?"
    );

} else {

    $stmt = $conexion->prepare(
        "UPDATE publicaciones
        SET titulo = ?,
            descripcion = ?,
            categoria_id = ?,
            imagen_url = ?,
            youtube_url = ?,
            noticia_url = ?
        WHERE id = ? AND autor_id = ?"
    );
}

if ($tiene_importante) {
    $sets[] = 'importante = ?';
    $types .= 'i';
    $valores[] = &$importante;
}

$types .= 'ii';
$valores[] = &$post_id;
$valores[] = &$autor_id;

$stmt = $conexion->prepare(
    "UPDATE publicaciones
    SET " . implode(', ', $sets) . "
    WHERE id = ? AND autor_id = ?"
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
        "sssisssii",
        $titulo,
        $descripcion,
        $tipo,
        $categoria_id,
        $imagen_url,
        $youtube_url,
        $noticia_url,
        $post_id,
        $autor_id
    );

} else {

    $stmt->bind_param(
        "ssisssii",
        $titulo,
        $descripcion,
        $categoria_id,
        $imagen_url,
        $youtube_url,
        $noticia_url,
        $post_id,
        $autor_id
    );
}

// ============================================
// EJECUTAR
// ============================================

if ($stmt->execute()) {

    echo json_encode([

        'success' => true,

        'imagen_url' => $imagen_url,

        'tipo' => $tipo,

        'categoria_id' => $categoria_id,

        'youtube_url' => $youtube_url,

        'noticia_url' => $noticia_url
    ]);

} else {

    echo json_encode([

        'success' => false,

        'error' => $stmt->error
    ]);
}

$stmt->close();

$conexion->close();

?>