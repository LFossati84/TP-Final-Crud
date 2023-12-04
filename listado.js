const URL = "https://mauropy.pythonanywhere.com/"

// Realizamos la solicitud GET al servidor para obtener todos los productos
fetch(URL + 'vehiculos')
    .then(function (response) {
        if (response.ok) {
            return response.json();
    } else   {
        // Si hubo un error, lanzar explícitamente una excepción
        // para ser "catcheada" más adelante
        throw new Error('Error al obtener vehículos.');
        }
    })
    .then(function (data) {
        let tablaVehiculos = document.getElementById('tablaVehiculos');
        // Iteramos sobre los productos y agregamos filas a la tabla
        for (let vehiculo of data) {
            let fila = document.createElement('tr');
            fila.innerHTML = '<td>' + vehiculo.codigo + '</td>' +
                '<td>' + vehiculo.marca + '</td>' +
                '<td align="right">' + vehiculo.modelo + '</td>' +
                '<td align="right">' + vehiculo.anio + '</td>' +
                '<td align="right">' + vehiculo.precio + '</td>' +
                // Mostrar miniatura de la imagen
                //'<td><img src=static/img/' + vehiculo.foto +' <alt="Imagen del producto" style="width: 100px;"></td>';
                //Una vez que se crea la fila con el contenido del producto, se agrega a la tabla utilizando el método appendChild del elemento tablaProductos.
            tablaVehiculos.appendChild(fila);
        }
    })
    .catch(function (error) {
        // En caso de error
        alert('Error al agregar el producto.');
        console.error('Error:', error);
    })