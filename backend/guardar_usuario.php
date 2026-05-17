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
$categorias = isset($_POST['categorias']) ? json_decode($_POST['categorias'], true) : [];

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

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $insert = $conexion->prepare('INSERT INTO usuarios (nombre, usuarios, correo, password, rol_id) VALUES (?, ?, ?, ?, ?)');
    $insert->bind_param('ssssi', $nombre, $username, $correo, $passwordHash, $rol_id);

    if ($insert->execute()) {
        $nuevoId = $conexion->insert_id;
        
        // Guardar categorías si es autor
        if (!empty($categorias) && is_array($categorias)) {
            $insertAutorCat = $conexion->prepare('INSERT INTO autor_categoria (autor_id, categoria_id) VALUES (?, ?)');
            foreach ($categorias as $cat_id) {
                $cat_id = intval($cat_id);
                $insertAutorCat->bind_param('ii', $nuevoId, $cat_id);
                $insertAutorCat->execute();
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
if (!empty($categorias) && is_array($categorias)) {
    // Eliminar categorías anteriores
    $deleteStmt = $conexion->prepare('DELETE FROM autor_categoria WHERE autor_id = ?');
    $deleteStmt->bind_param('i', $id);
    $deleteStmt->execute();
    $deleteStmt->close();
    
    // Insertar nuevas categorías
    $insertAutorCat = $conexion->prepare('INSERT INTO autor_categoria (autor_id, categoria_id) VALUES (?, ?)');
    foreach ($categorias as $cat_id) {
        $cat_id = intval($cat_id);
        $insertAutorCat->bind_param('ii', $id, $cat_id);
        $insertAutorCat->execute();
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
