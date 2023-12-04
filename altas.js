// const URL = "http://127.0.0.1:5500/"
const URL = "https://mauropy.pythonanywhere.com/"

// Capturamos el evento de envío del formulario
document.getElementById('formulario').addEventListener('submit', function (event) {
    event.preventDefault(); // Evitamos que se envie el form 

    var formData = new FormData();
    formData.append('codigo', document.getElementById('codigo').value);
    formData.append('marca', document.getElementById('marca').value);
    formData.append('modelo', document.getElementById('modelo').value);
    formData.append('anio', document.getElementById('anio').value);
    formData.append('precio', document.getElementById('precio').value);
    formData.append('foto', document.getElementById('foto').value); //files[0]);
    
    fetch(URL + 'vehiculos', {
        method: 'POST',
        body: formData // Aquí enviamos formData en lugar de JSON
    })
    .then(function (response) {
        if (response.ok) { return response.json(); }
    })
    .then(function (data) {
        alert('Vehiculo agregado correctamente.');
        // Limpiar el formulario para el proximo producto
        document.getElementById('codigo').value = "";
        document.getElementById('marca').value = "";
        document.getElementById('modelo').value = "";
        document.getElementById('anio').value = "";
        document.getElementById('precio').value = "";
        document.getElementById('foto').value = "";
    })
    .catch(function (error) {
        // Mostramos el error, y no limpiamos el form.
        alert('Error al agregar el vehículo.' + error.stack);
    });
    
})