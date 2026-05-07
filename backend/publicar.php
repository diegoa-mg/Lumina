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
if (!empty($data['imagen']) && strpos($data['imagen'], 'data:image') === 0) {
    // Extraer formato y datos Base64
    if (preg_match('/data:image\/(\w+);base64,(.*)/', $data['imagen'], $matches)) {
        $formato = $matches[1];  // jpeg, png, webp, etc
        $base64 = $data['imagen_url'] ?? null;
        
        // Validar tamaño
        if (strlen($base64) / 1024 > 5120) { // 5MB
            echo json_encode(['success' => false, 'error' => 'Imagen no debe superar 5MB']);
            exit;
        }
        
        // Validar formato
        $formatos_permitidos = ['jpeg', 'jpg', 'png', 'webp'];
        if (!in_array($formato, $formatos_permitidos)) {
            echo json_encode(['success' => false, 'error' => 'Formato no permitido (JPG, PNG, WebP)']);
            exit;
        }
        
        // Guardar archivo en servidor
        $nombre_archivo = 'post_' . $autor_id . '_' . time() . '.' . $formato;
        $ruta_directorio = __DIR__ . '/../uploads/posts/';
        $ruta_archivo = $ruta_directorio . $nombre_archivo;
        
        // Crear directorio si no existe
        if (!is_dir($ruta_directorio)) {
            mkdir($ruta_directorio, 0755, true);
        }
        
        // Decodificar y guardar
        if (!file_put_contents($ruta_archivo, base64_decode($base64))) {
            echo json_encode(['success' => false, 'error' => 'Error al guardar imagen']);
            exit;
        }
        $imagen_url = 'uploads/posts/' . $nombre_archivo;
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