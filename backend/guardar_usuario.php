<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

include 'conexion_bd.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'mensaje' => 'No hay sesión activa.']);
    exit;
}

$rolSesion = $_SESSION['rol'] ?? '';
if (strtolower($rolSesion) !== 'administrador') {
    http_response_code(403);
    echo json_encode(['ok' => false, 'mensaje' => 'Acceso denegado.']);
    exit;
}

$id = isset($_POST['id']) ? intval($_POST['id']) : 0;
$nombre = trim($_POST['nombre'] ?? '');
$correo = trim($_POST['email'] ?? '');
$password = trim($_POST['password'] ?? '');
$rol_id = isset($_POST['rol_id']) ? intval($_POST['rol_id']) : 0;
$usuario = trim($_POST['usuario'] ?? '');
$categorias = isset($_POST['categorias']) ? json_decode($_POST['categorias'], true) : [];
$foto = trim($_POST['foto'] ?? '');

function rol_es_autor($conexion, $rol_id) {
    if ($rol_id <= 0) {
        return false;
    }

    $stmt = $conexion->prepare('SELECT nombre FROM roles WHERE id = ? LIMIT 1');
    $stmt->bind_param('i', $rol_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $rol = $result ? $result->fetch_assoc() : null;
    $stmt->close();

    return $rol && strtolower($rol['nombre']) === 'autor';
}

function guardar_foto_usuario_admin($conexion, $usuarioId, $imagen) {
    if ($imagen === '') {
        return true;
    }

    if (strpos($imagen, 'data:image') !== 0 || !preg_match('/^data:image\/(\w+);base64,(.*)$/', $imagen, $matches)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'La foto seleccionada no es valida.']);
        exit;
    }

    $formato = strtolower($matches[1]);
    $base64 = $matches[2];
    $formatosPermitidos = ['jpg', 'jpeg', 'png', 'webp'];

    if (!in_array($formato, $formatosPermitidos, true)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'Formato de foto no permitido.']);
        exit;
    }

    if ((strlen($base64) * 0.75) / 1024 > 5120) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'La foto es demasiado pesada.']);
        exit;
    }

    $directorio = __DIR__ . '/../frontend/uploads/perfiles/';
    if (!is_dir($directorio) && !mkdir($directorio, 0777, true)) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => 'No se pudo crear la carpeta de perfiles.']);
        exit;
    }

    $contenido = base64_decode($base64, true);
    if ($contenido === false) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'No se pudo procesar la foto.']);
        exit;
    }

    $nombreArchivo = 'perfil_' . $usuarioId . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $formato;
    $rutaArchivo = $directorio . $nombreArchivo;

    if (file_put_contents($rutaArchivo, $contenido) === false) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => 'No se pudo guardar la foto.']);
        exit;
    }

    $fotoUrl = 'uploads/perfiles/' . $nombreArchivo;
    $stmt = $conexion->prepare('UPDATE usuarios SET foto_url = ? WHERE id = ?');
    $stmt->bind_param('si', $fotoUrl, $usuarioId);
    $ok = $stmt->execute();
    $stmt->close();

    return $ok;
}

if ($id <= 0) {
    if ($nombre === '' || $correo === '' || $rol_id <= 0 || $password === '') {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'Todos los campos son obligatorios y la contraseña es necesaria.']);
        exit;
    }

    $stmt = $conexion->prepare('SELECT COUNT(*) AS total FROM usuarios WHERE correo = ?');
    $stmt->bind_param('s', $correo);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();

    if ($row['total'] > 0) {
        http_response_code(409);
        echo json_encode(['ok' => false, 'mensaje' => 'Ya existe un usuario con ese correo.']);
        exit;
    }

    if ($usuario !== '') {
        $username = preg_replace('/[^a-zA-Z0-9\.\-_]/', '', $usuario);
        if ($username === '') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'mensaje' => 'El nombre de usuario no es válido.']);
            exit;
        }

        $check = $conexion->prepare('SELECT id FROM usuarios WHERE usuarios = ? LIMIT 1');
        $check->bind_param('s', $username);
        $check->execute();
        $existeUsuario = $check->get_result()->num_rows > 0;
        $check->close();

        if ($existeUsuario) {
            http_response_code(409);
            echo json_encode(['ok' => false, 'mensaje' => 'Ya existe un usuario con ese nombre de usuario.']);
            exit;
        }
    } else {
        $usernameBase = preg_replace('/[^a-z0-9\.\-_]/', '', strtolower(strtok($correo, '@')));
        $username = $usernameBase ?: 'usuario' . rand(10000, 99999);
        $counter = 1;
        while (true) {
            $check = $conexion->prepare('SELECT id FROM usuarios WHERE usuarios = ? LIMIT 1');
            $check->bind_param('s', $username);
            $check->execute();
            $existing = $check->get_result();
            $check->close();

            if ($existing && $existing->num_rows === 0) {
                break;
            }

            $username = $usernameBase . $counter;
            $counter++;
        }
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $insert = $conexion->prepare('INSERT INTO usuarios (nombre, usuarios, correo, password, rol_id) VALUES (?, ?, ?, ?, ?)');
    $insert->bind_param('ssssi', $nombre, $username, $correo, $passwordHash, $rol_id);

    if ($insert->execute()) {
        $nuevoId = $conexion->insert_id;
        guardar_foto_usuario_admin($conexion, $nuevoId, $foto);
        
        // Guardar categorías si es autor
        if (rol_es_autor($conexion, $rol_id) && !empty($categorias) && is_array($categorias)) {
            $insertAutorCat = $conexion->prepare('INSERT INTO autor_categoria (autor_id, categoria_id) VALUES (?, ?)');
            foreach ($categorias as $cat_id) {
                $cat_id = intval($cat_id);
                if ($cat_id > 0) {
                    $insertAutorCat->bind_param('ii', $nuevoId, $cat_id);
                    $insertAutorCat->execute();
                }
            }
            $insertAutorCat->close();
        }
        
        echo json_encode(['ok' => true, 'mensaje' => 'Usuario creado correctamente.', 'usuario_id' => $nuevoId]);
        exit;
    }

    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'No se pudo crear el usuario.']);
    exit;
}

$updated = false;

if ($nombre !== '') {
    $stmt = $conexion->prepare('UPDATE usuarios SET nombre = ? WHERE id = ?');
    $stmt->bind_param('si', $nombre, $id);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => 'Error al actualizar el nombre.']);
        exit;
    }
    $updated = true;
}

if ($correo !== '') {
    $stmt = $conexion->prepare('SELECT COUNT(*) AS total FROM usuarios WHERE correo = ? AND id <> ?');
    $stmt->bind_param('si', $correo, $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();

    if ($row['total'] > 0) {
        http_response_code(409);
        echo json_encode(['ok' => false, 'mensaje' => 'Ya existe otro usuario con ese correo.']);
        exit;
    }

    $stmt = $conexion->prepare('UPDATE usuarios SET correo = ? WHERE id = ?');
    $stmt->bind_param('si', $correo, $id);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => 'Error al actualizar el correo.']);
        exit;
    }
    $updated = true;
}

if ($usuario !== '') {
    $username = preg_replace('/[^a-zA-Z0-9\.\-_]/', '', $usuario);
    if ($username === '') {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'El nombre de usuario no es válido.']);
        exit;
    }

    $stmt = $conexion->prepare('SELECT COUNT(*) AS total FROM usuarios WHERE usuarios = ? AND id <> ?');
    $stmt->bind_param('si', $username, $id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if ($row['total'] > 0) {
        http_response_code(409);
        echo json_encode(['ok' => false, 'mensaje' => 'Ya existe otro usuario con ese nombre de usuario.']);
        exit;
    }

    $stmt = $conexion->prepare('UPDATE usuarios SET usuarios = ? WHERE id = ?');
    $stmt->bind_param('si', $username, $id);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => 'Error al actualizar el nombre de usuario.']);
        exit;
    }
    $updated = true;
}

if ($rol_id > 0) {
    $stmt = $conexion->prepare('UPDATE usuarios SET rol_id = ? WHERE id = ?');
    $stmt->bind_param('ii', $rol_id, $id);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => 'Error al actualizar el rol.']);
        exit;
    }
    $updated = true;
}

if ($password !== '') {
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conexion->prepare('UPDATE usuarios SET password = ? WHERE id = ?');
    $stmt->bind_param('si', $passwordHash, $id);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => 'Error al actualizar la contraseña.']);
        exit;
    }
    $updated = true;
}

// Guardar/actualizar categorías si es autor
if ($foto !== '') {
    if (!guardar_foto_usuario_admin($conexion, $id, $foto)) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => 'No se pudo actualizar la foto.']);
        exit;
    }
    $updated = true;
}

if ($rol_id > 0 && !rol_es_autor($conexion, $rol_id)) {
    $deleteStmt = $conexion->prepare('DELETE FROM autor_categoria WHERE autor_id = ?');
    $deleteStmt->bind_param('i', $id);
    $deleteStmt->execute();
    $deleteStmt->close();
    $updated = true;
}

if ($rol_id > 0 && rol_es_autor($conexion, $rol_id) && is_array($categorias)) {
    // Eliminar categorías anteriores
    $deleteStmt = $conexion->prepare('DELETE FROM autor_categoria WHERE autor_id = ?');
    $deleteStmt->bind_param('i', $id);
    $deleteStmt->execute();
    $deleteStmt->close();
    
    // Insertar nuevas categorías
    $insertAutorCat = $conexion->prepare('INSERT INTO autor_categoria (autor_id, categoria_id) VALUES (?, ?)');
    foreach ($categorias as $cat_id) {
        $cat_id = intval($cat_id);
        if ($cat_id > 0) {
            $insertAutorCat->bind_param('ii', $id, $cat_id);
            $insertAutorCat->execute();
        }
    }
    $insertAutorCat->close();
    $updated = true;
}

if (!$updated) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'mensaje' => 'No se encontraron cambios para actualizar.']);
    exit;
}

echo json_encode(['ok' => true, 'mensaje' => 'Usuario actualizado correctamente.']);
exit;
