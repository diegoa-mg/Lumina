<?php

header('Content-Type: application/json');

session_start();

include 'conexion_bd.php';


// ============================================
// VALIDAR SESIÓN
// ============================================

if (!isset($_SESSION['usuario_id'])) {

    echo json_encode([
        'success' => false,
        'error' => 'No autorizado'
    ]);

    exit;
}


// ============================================
// RECIBIR DATOS
// ============================================

$data = json_decode(
    file_get_contents("php://input"),
    true
);

if (!$data) {

    echo json_encode([
        'success' => false,
        'error' => 'Datos inválidos'
    ]);

    exit;
}


// ============================================
// DATOS
// ============================================

$post_id = intval($data['post_id'] ?? 0);

$titulo = trim($data['titulo'] ?? '');

$descripcion = trim($data['descripcion'] ?? '');

$tipo = trim($data['tipo'] ?? 'articulo');

$imagen = $data['imagen'] ?? null;


// ============================================
// VALIDAR
// ============================================

if (!$post_id || !$titulo || !$descripcion) {

    echo json_encode([
        'success' => false,
        'error' => 'Campos incompletos'
    ]);

    exit;
}


// ============================================
// OBTENER POST
// ============================================

$stmt = $conexion->prepare(

    "SELECT imagen_url
    FROM publicaciones
    WHERE id = ?"

);

$stmt->bind_param("i", $post_id);

$stmt->execute();

$resultado = $stmt->get_result();

$post = $resultado->fetch_assoc();

if (!$post) {

    echo json_encode([
        'success' => false,
        'error' => 'Post no encontrado'
    ]);

    exit;
}

$imagen_url = $post['imagen_url'];


// ============================================
// NUEVA IMAGEN
// ============================================

if ($imagen && strpos($imagen, 'data:image') === 0) {

    preg_match(
        '/data:image\/(\w+);base64,(.*)/',
        $imagen,
        $matches
    );

    $formato = $matches[1];

    $contenido = base64_decode($matches[2]);

    $nombre_archivo =
        'post_' .
        time() .
        '.' .
        $formato;

    $ruta =
        __DIR__ .
        '/../frontend/uploads/posts/' .
        $nombre_archivo;

    file_put_contents($ruta, $contenido);

    $imagen_url =
        'uploads/posts/' .
        $nombre_archivo;
}


// ============================================
// ACTUALIZAR
// ============================================

$stmt = $conexion->prepare(

    "UPDATE publicaciones
    SET
        titulo = ?,
        descripcion = ?,
        tipo = ?,
        imagen_url = ?
    WHERE id = ?"

);

$stmt->bind_param(

    "ssssi",

    $titulo,
    $descripcion,
    $tipo,
    $imagen_url,
    $post_id
);


// ============================================
// EJECUTAR
// ============================================

if ($stmt->execute()) {

    echo json_encode([
        'success' => true
    ]);

} else {

    echo json_encode([
        'success' => false,
        'error' => $stmt->error
    ]);
}

?>