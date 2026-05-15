DELETE r
FROM reacciones r
INNER JOIN publicaciones p ON p.id = r.elemento_id
WHERE r.tipo_reaccion = 'like'
  AND p.seccion = 'aviso';
