function reaccionar(id, seccion, tipo) {
    const datos = new FormData();
    datos.append('elemento_id', id);
    datos.append('seccion', seccion);
    datos.append('tipo', tipo);

    fetch('../backend/reacciones.php', {
        method: 'POST',
        body: datos
    })
    .then(response => {
        if (!response.ok) throw new Error('Error en el servidor');
        return response.text();
    })
    .then(mensaje => {
        // AQUÍ SE PROCESA TODO JUNTO
        console.log("Respuesta de Lumina:", mensaje);
        
        // Si quieres que el usuario vea el mensaje en una ventana:
        // alert(mensaje); 
        
        // Si prefieres que el sistema sea silencioso, comenta el alert con //
    })
    .catch(error => {
        console.error('Error en la comunicación:', error);
    });
}