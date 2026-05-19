<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

include 'conexion_bd.php';

// Verificar permisos de Administrador
if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No hay una sesión activa.']);
    exit;
}

$usuario_id = (int) $_SESSION['usuario_id'];
$rol_stmt = $conexion->prepare('SELECT rol_id FROM usuarios WHERE id = ?');
$rol_stmt->bind_param('i', $usuario_id);
$rol_stmt->execute();
$rol_id = intval($rol_stmt->get_result()->fetch_assoc()['rol_id'] ?? 0);
$rol_stmt->close();

if ($rol_id !== 4) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso denegado.']);
    exit;
}

// Procesar datos de entrada
$datos = json_decode(file_get_contents('php://input'), true);
$categoria_id = isset($datos['id']) ? (int)$datos['id'] : null;
$nombre_categoria = trim($datos['nombre_categoria'] ?? '');
$imagen_base64 = $datos['imagen'] ?? '';
$imagen_url_input = trim($datos['imagen_url'] ?? '');

if ($nombre_categoria === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'El nombre de la categoría es obligatorio.']);
    exit;
}

$imagen_url = null;

// Ruta de imagen predefinida (selector del modal)
if ($imagen_url_input !== '' && strpos($imagen_url_input, 'data:image') !== 0) {
    if (preg_match('#^(img/|uploads/)[a-zA-Z0-9_./-]+$#', $imagen_url_input)) {
        $imagen_url = $imagen_url_input;
    }
}

// Imagen subida en base64
if ($imagen_base64 && strpos($imagen_base64, 'data:image') === 0) {
    if (preg_match('/^data:image\/(\w+);base64,(.*)$/', $imagen_base64, $matches)) {
        $formato = strtolower($matches[1]);
        $base64 = $matches[2];
        $formatosPermitidos = ['jpg', 'jpeg', 'png', 'webp'];

        if (in_array($formato, $formatosPermitidos, true)) {
            $directorio = __DIR__ . '/../frontend/uploads/categorias/';
            
            if (!is_dir($directorio)) {
                mkdir($directorio, 0777, true);
            }

            $contenido = base64_decode($base64, true);
            if ($contenido !== false) {
                $nombreArchivo = 'cat_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $formato;
                $rutaArchivo = $directorio . $nombreArchivo;

                if (file_put_contents($rutaArchivo, $contenido) !== false) {
                    $imagen_url = 'uploads/categorias/' . $nombreArchivo;
                }
            }
        }
    }
}

if ($categoria_id) {
    // --- MODO EDICIÓN ---
    if ($imagen_url) {
        // Se actualiza nombre e imagen
        $sql = "UPDATE categorias SET nombre_categoria = ?, imagen_url = ? WHERE id = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param('ssi', $nombre_categoria, $imagen_url, $categoria_id);
    } else {
        // Solo se actualiza el nombre
        $sql = "UPDATE categorias SET nombre_categoria = ? WHERE id = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param('si', $nombre_categoria, $categoria_id);
    }
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'mensaje' => 'Categoría actualizada correctamente.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'No se pudo actualizar la categoría.']);
    }
    $stmt->close();

} else {
    // --- MODO CREACIÓN ---
    if (!$imagen_url) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Selecciona una imagen para la categoría.']);
        exit;
    }

    $sql = "INSERT INTO categorias (nombre_categoria, imagen_url) VALUES (?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param('ss', $nombre_categoria, $imagen_url);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'mensaje' => 'Categoría creada correctamente.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'No se pudo crear la categoría o ya existe.']);
    }
    $stmt->close();
}

$conexion->close();
?>