<?php

header('Content-Type: application/json');

include 'conexion_bd.php';
include 'post_helpers.php';

$tiene_seccion = publicaciones_tiene_columna($conexion, 'seccion');
$tipo_aviso_select = publicaciones_tiene_columna($conexion, 'tipo_aviso')
    ? "publicaciones.tipo_aviso"
    : "'academico' AS tipo_aviso";
$urgente_select = publicaciones_tiene_columna($conexion, 'urgente')
    ? "publicaciones.urgente"
    : "0 AS urgente";
$orden_urgente = publicaciones_tiene_columna($conexion, 'urgente')
    ? "publicaciones.urgente DESC,"
    : "";
$where_aviso = $tiene_seccion
    ? "(publicaciones.seccion = 'aviso' OR publicaciones.categoria_id = 9 OR categorias.nombre_categoria = 'Avisos Generales')"
    : "(publicaciones.categoria_id = 9 OR categorias.nombre_categoria = 'Avisos Generales')";
$where_no_importante = publicaciones_tiene_columna($conexion, 'importante')
    ? "AND publicaciones.importante <> 1"
    : "AND (publicaciones.imagen_url IS NULL OR publicaciones.imagen_url = '')";

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
LEFT JOIN categorias
ON publicaciones.categoria_id = categorias.id
WHERE publicaciones.status = 'publicado'
AND $where_aviso
$where_no_importante
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
