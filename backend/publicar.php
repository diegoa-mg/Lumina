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
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

// ============================================
// 2. RECIBIR Y VALIDAR DATOS
// ============================================
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
    exit;
}

// Validar campos
$titulo = trim($data['titulo'] ?? '');
$descripcion = trim($data['descripcion'] ?? '');
$status = $data['status'] ?? 'borrador';

if (empty($titulo) || empty($descripcion)) {
    echo json_encode(['success' => false, 'error' => 'Título y descripción son obligatorios']);
    exit;
}

// Validar status permitido
$status_permitidos = ['borrador', 'revision'];
if (!in_array($status, $status_permitidos)) {
    echo json_encode(['success' => false, 'error' => 'Estado inválido']);
    exit;
}

$autor_id = $_SESSION['usuario_id'];
$imagen_url = null;

// ============================================
// 3. PROCESAR IMAGEN (si viene)
// ============================================
// SECCIÓN 3: PROCESAR IMAGEN
if (!empty($data['imagen']) && strpos($data['imagen'], 'data:image') === 0) {
    if (preg_match('/data:image\/(\w+);base64,(.*)/', $data['imagen'], $matches)) {
        $formato = $matches[1];
        $base64_puro = $matches[2]; // Contenido real
        
        // Calcular tamaño real aproximado
        $tamanio_kb = (strlen($base64_puro) * 0.75) / 1024;
        if ($tamanio_kb > 5120) {
            echo json_encode(['success' => false, 'error' => 'La imagen es demasiado pesada']);
            exit;
        }

        $nombre_archivo = 'post_1_' . time() . '.' . $formato;
        $ruta_directorio = __DIR__ . '/../frontend/uploads/posts/'; // Ruta absoluta desde backend
        $ruta_archivo = $ruta_directorio . $nombre_archivo;

        if (!is_dir($ruta_directorio)) {
            mkdir($ruta_directorio, 0775, true);
        }

        // DECODIFICAR Y GUARDAR
        if (file_put_contents($ruta_archivo, base64_decode($base64_puro)) === false) {
            echo json_encode(['success' => false, 'error' => 'Error de escritura. Revisa permisos en Fedora.']);
            exit;
        }
        
        $imagen_url = 'uploads/posts/' . $nombre_archivo; // Ruta para la DB
    }
}

// ============================================
// 4. INSERTAR EN BASE DE DATOS
// ============================================
$stmt = $conexion->prepare(
    "INSERT INTO publicaciones 
     (titulo, descripcion, imagen_url, status, autor_id) 
     VALUES (?, ?, ?, ?, ?)"
);

if (!$stmt) {
    echo json_encode(['success' => false, 'error' => 'Error en preparación: ' . $conexion->error]);
    exit;
}

// Bind parameters: s=string, i=integer
$stmt->bind_param("ssssi", $titulo, $descripcion, $imagen_url, $status, $autor_id);

// ============================================
// 5. EJECUTAR Y RESPONDER
// ============================================
if ($stmt->execute()) {
    $post_id = $conexion->insert_id;
    
    echo json_encode([
        'success' => true,
        'post_id' => $post_id,
        'imagen_url' => $imagen_url,
        'mensaje' => 'Post guardado correctamente'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Error al ejecutar: ' . $stmt->error
    ]);
}

$stmt->close();
$conexion->close();
?>