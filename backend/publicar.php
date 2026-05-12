<?php
// backend/publicar.php

header('Content-Type: application/json');

session_start();

include 'conexion_bd.php';


// ============================================
// 1. VALIDAR AUTENTICACIÓN
// ============================================

if (!isset($_SESSION['usuario_id'])) {

    http_response_code(401);

    echo json_encode([
        'success' => false,
        'error' => 'No autorizado'
    ]);

    exit;
}


// ============================================
// 2. RECIBIR DATOS
// ============================================

$json = file_get_contents('php://input');

$data = json_decode($json, true);

if (!$data) {

    echo json_encode([
        'success' => false,
        'error' => 'Datos inválidos'
    ]);

    exit;
}


// ============================================
// 3. VALIDAR CAMPOS
// ============================================

$titulo = trim($data['titulo'] ?? '');

$descripcion = trim($data['descripcion'] ?? '');

$tipo = trim($data['tipo'] ?? 'articulo');

$status = trim($data['status'] ?? 'borrador');

if (empty($titulo) || empty($descripcion)) {

    echo json_encode([
        'success' => false,
        'error' => 'Título y descripción son obligatorios'
    ]);

    exit;
}

$autor_id = $_SESSION['usuario_id'];

$imagen_url = null;


// ============================================
// 4. PROCESAR IMAGEN
// ============================================

if (
    !empty($data['imagen']) &&
    strpos($data['imagen'], 'data:image') === 0
) {

    if (
        preg_match(
            '/data:image\/(\w+);base64,(.*)/',
            $data['imagen'],
            $matches
        )
    ) {

        $formato = strtolower($matches[1]);
        $base64_puro = $matches[2];

        // VALIDAR FORMATOS
        $formatosPermitidos = ['jpg', 'jpeg', 'png', 'webp'];

        if (!in_array($formato, $formatosPermitidos)) {

            echo json_encode([
                'success' => false,
                'error' => 'Formato de imagen no permitido'
            ]);

            exit;
        }

        // VALIDAR TAMAÑO
        $tamanio_kb = (strlen($base64_puro) * 0.75) / 1024;

        if ($tamanio_kb > 5120) {

            echo json_encode([
                'success' => false,
                'error' => 'La imagen es demasiado pesada'
            ]);

            exit;
        }

        // NOMBRE ÚNICO
        $nombre_archivo =
            'post_' .
            $autor_id .
            '_' .
            time() .
            '.' .
            $formato;

        // CARPETA
        $ruta_directorio =
            __DIR__ . '/../frontend/uploads/posts/';

        // CREAR SI NO EXISTE
        if (!is_dir($ruta_directorio)) {

            mkdir($ruta_directorio, 0777, true);
        }

        // RUTA COMPLETA
        $ruta_archivo =
            $ruta_directorio . $nombre_archivo;

        // DECODIFICAR IMAGEN
        $imagen_decodificada =
            base64_decode($base64_puro);

        if ($imagen_decodificada === false) {

            echo json_encode([
                'success' => false,
                'error' => 'Error al decodificar imagen'
            ]);

            exit;
        }

        // GUARDAR ARCHIVO
        $guardado = file_put_contents(
            $ruta_archivo,
            $imagen_decodificada
        );

        if ($guardado === false) {

            echo json_encode([
                'success' => false,
                'error' => 'Error al guardar imagen'
            ]);

            exit;
        }

        // URL PARA FRONTEND
        $imagen_url =
            'uploads/posts/' . $nombre_archivo;
    }
}


// ============================================
// 5. INSERTAR EN BASE DE DATOS
// ============================================

$stmt = $conexion->prepare(

    "INSERT INTO publicaciones
(
    titulo,
    descripcion,
    imagen_url,
    tipo,
    status,
    autor_id
)
VALUES (?, ?, ?, ?, ?, ?)"

);

if (!$stmt) {

    echo json_encode([
        'success' => false,
        'error' => 'Error SQL: ' . $conexion->error
    ]);

    exit;
}

$stmt->bind_param(
    "sssssi",

    $titulo,

    $descripcion,

    $imagen_url,

    $tipo,

    $status,

    $autor_id
);
// ============================================
// 6. EJECUTAR
// ============================================

if ($stmt->execute()) {

    $post_id = $conexion->insert_id;

    echo json_encode([

        'success' => true,

        'post_id' => $post_id,

        'imagen_url' => $imagen_url,

        'status' => $status,

        'mensaje' => 'Publicación creada correctamente'

    ]);

} else {

    echo json_encode([

        'success' => false,

        'error' => 'Error al guardar: ' . $stmt->error

    ]);
}


// ============================================
// 7. CERRAR
// ============================================

$stmt->close();

$conexion->close();

?>