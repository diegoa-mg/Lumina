<?php

header('Content-Type: application/json');

include 'conexion_bd.php';
include 'post_helpers.php';

if (!publicaciones_tiene_columna($conexion, 'seccion')) {
    echo json_encode([]);
    $conexion->close();
    exit;
}

$tipo_aviso_select = publicaciones_tiene_columna($conexion, 'tipo_aviso')
    ? "publicaciones.tipo_aviso"
    : "'academico' AS tipo_aviso";
$urgente_select = publicaciones_tiene_columna($conexion, 'urgente')
    ? "publicaciones.urgente"
    : "0 AS urgente";
$orden_urgente = publicaciones_tiene_columna($conexion, 'urgente')
    ? "publicaciones.urgente DESC,"
    : "";

$sql = "
SELECT
    publicaciones.id,
    publicaciones.titulo,
    publicaciones.descripcion,
    publicaciones.status,
    $tipo_aviso_select,
    $urgente_select,
    publicaciones.fecha_publicacion,
    publicaciones.fecha_creacion,
    usuarios.nombre AS autor
FROM publicaciones
INNER JOIN usuarios
ON publicaciones.autor_id = usuarios.id
WHERE publicaciones.status = 'publicado'
AND publicaciones.seccion = 'aviso'
ORDER BY
    $orden_urgente
    COALESCE(publicaciones.fecha_publicacion, publicaciones.fecha_creacion) DESC
";

$resultado = $conexion->query($sql);
$avisos = [];

if ($resultado) {
    while ($fila = $resultado->fetch_assoc()) {
        $avisos[] = $fila;
    }
}

echo json_encode($avisos);

$conexion->close();

?>
