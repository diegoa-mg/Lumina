<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

include 'conexion_bd.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'No hay una sesion activa.'
    ]);
    exit;
}

$datos = json_decode(file_get_contents('php://input'), true);
$imagen = $datos['imagen'] ?? '';
$archivoImagen = $_FILES['image_file'] ?? null;
$formatosPermitidos = ['jpg', 'jpeg', 'png', 'webp'];
$contenido = null;
$formato = '';

if (is_array($archivoImagen) && intval($archivoImagen['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
    $error = intval($archivoImagen['error'] ?? UPLOAD_ERR_NO_FILE);

    if ($error !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode([
            'ok' => false,
            'mensaje' => 'No se pudo recibir la imagen.'
        ]);
        exit;
    }

    if (($archivoImagen['size'] ?? 0) > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode([
            'ok' => false,
            'mensaje' => 'La imagen es demasiado pesada.'
        ]);
        exit;
    }

    $formato = strtolower(pathinfo($archivoImagen['name'] ?? '', PATHINFO_EXTENSION));
    $mimePermitidos = [
        'image/jpeg' => true,
        'image/png' => true,
        'image/webp' => true
    ];
    $mimeDetectado = function_exists('mime_content_type') ? mime_content_type($archivoImagen['tmp_name']) : ($archivoImagen['type'] ?? '');

    if (!in_array($formato, $formatosPermitidos, true) || !isset($mimePermitidos[$mimeDetectado])) {
        http_response_code(400);
        echo json_encode([
            'ok' => false,
            'mensaje' => 'Formato de imagen no permitido.'
        ]);
        exit;
    }

    $contenido = file_get_contents($archivoImagen['tmp_name']);
} else {
    if (!$imagen || strpos($imagen, 'data:image') !== 0) {
        http_response_code(400);
        echo json_encode([
            'ok' => false,
            'mensaje' => 'Selecciona una imagen valida.'
        ]);
        exit;
    }

    if (!preg_match('/^data:image\/(\w+);base64,(.*)$/', $imagen, $matches)) {
        http_response_code(400);
        echo json_encode([
            'ok' => false,
            'mensaje' => 'Formato de imagen invalido.'
        ]);
        exit;
    }

    $formato = strtolower($matches[1]);
    $base64 = $matches[2];

    if (!in_array($formato, $formatosPermitidos, true)) {
        http_response_code(400);
        echo json_encode([
            'ok' => false,
            'mensaje' => 'Formato de imagen no permitido.'
        ]);
        exit;
    }

    $tamanioKb = (strlen($base64) * 0.75) / 1024;

    if ($tamanioKb > 5120) {
        http_response_code(400);
        echo json_encode([
            'ok' => false,
            'mensaje' => 'La imagen es demasiado pesada.'
        ]);
        exit;
    }

    $contenido = base64_decode($base64, true);
}

$usuarioId = (int) $_SESSION['usuario_id'];
$directorio = __DIR__ . '/../frontend/uploads/perfiles/';
$stmtFotoAnterior = $conexion->prepare('SELECT foto_url FROM usuarios WHERE id = ? LIMIT 1');

if (!$stmtFotoAnterior) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'No se pudo consultar la foto actual.'
    ]);
    exit;
}

$stmtFotoAnterior->bind_param('i', $usuarioId);
$stmtFotoAnterior->execute();
$fotoAnteriorRow = $stmtFotoAnterior->get_result()->fetch_assoc();
$stmtFotoAnterior->close();
$fotoAnterior = $fotoAnteriorRow['foto_url'] ?? '';

if (!is_dir($directorio) && !mkdir($directorio, 0777, true)) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'No se pudo crear la carpeta de perfiles.'
    ]);
    exit;
}

if ($contenido === false) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'No se pudo procesar la imagen.'
    ]);
    exit;
}

$nombreArchivo = 'perfil_' . $usuarioId . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $formato;
$rutaArchivo = $directorio . $nombreArchivo;

if (file_put_contents($rutaArchivo, $contenido) === false) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'No se pudo guardar la imagen.'
    ]);
    exit;
}

$fotoUrl = 'uploads/perfiles/' . $nombreArchivo;
$stmt = $conexion->prepare('UPDATE usuarios SET foto_url = ? WHERE id = ?');
$stmt->bind_param('si', $fotoUrl, $usuarioId);

if (!$stmt->execute()) {
    if (is_file($rutaArchivo)) {
        unlink($rutaArchivo);
    }

    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'No se pudo actualizar la foto de perfil.'
    ]);
    exit;
}

$rutaFotoAnterior = realpath(__DIR__ . '/../frontend/' . $fotoAnterior);
$directorioReal = realpath($directorio);

if (
    $fotoAnterior
    && $fotoAnterior !== $fotoUrl
    && $rutaFotoAnterior
    && $directorioReal
    && strpos($rutaFotoAnterior, $directorioReal . DIRECTORY_SEPARATOR) === 0
    && is_file($rutaFotoAnterior)
) {
    unlink($rutaFotoAnterior);
}

echo json_encode([
    'ok' => true,
    'foto_url' => $fotoUrl,
    'mensaje' => 'Foto de perfil actualizada correctamente.'
]);

?>
