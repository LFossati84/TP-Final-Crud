// const URL = "http://127.0.0.1:5000/"
const URL = "https://mauropy.pythonanywhere.com/"

const app = Vue.createApp({
    data() {
        return {
            codigo: '',
            marca: '',
            modelo: '',
            anio: '',
            precio: '',
            foto: '',
            imagenUrlTemp: null,
            mostrarDatosProducto: false,
        };
    },

    methods: {
        obtenerVehiculo() {
            fetch(URL + 'vehiculo/' + this.codigo)
                .then(response => {
                    if (response.ok) {
                        return response.json()
                    } else {
                        //Si la respuesta es un error, lanzamos una excepción para ser "catcheada" más adelante en el catch.
                        throw new Error('Error al obtener los datos del vehículo.')
                    }
                })

                .then(data => {
                    this.marca = data.marca;
                    this.modelo = data.modelo;
                    this.anio = data.anio;
                    this.precio = data.precio;
                    this.foto = data.foto;
                    this.mostrarDatosProducto = true;
                })
                .catch(error => {
                    console.log(error);
                    alert('Código no encontrado.');
                })
        },
        seleccionarImagen(event) {
            const file = event.target.files[0];
            this.imagenSeleccionada = file;
            this.imagenUrlTemp = URL.createObjectURL(file); // Crea una URL temporal para la vista previa
        },
        guardarCambios() {
            const formData = new FormData();
            formData.append('codigo', this.codigo);
            formData.append('marca', this.marca);
            formData.append('modelo', this.modelo);
            formData.append('anio', this.anio);
            formData.append('precio', this.precio);

            if (this.imagenSeleccionada) {
                formData.append('foto', this.imagenSeleccionada, this.imagenSeleccionada.name);
        }
            //Utilizamos fetch para realizar una solicitud PUT a la API y guardar los cambios.
            fetch(URL + 'vehiculos/' + this.codigo, {
                method: 'PUT',
                body: formData,
            })
            .then(response => {
                //Si la respuesta es exitosa, utilizamos response.json() para parsear la respuesta en formato JSON.
                if (response.ok) {
                    return response.json()
                } else {
                    //Si la respuesta es un error, lanzamos una excepción.
                    throw new Error('Error al guardar los cambios del vehículo.')
                }
            })
            .then(data => {
                alert('Vehículo actualizado correctamente.');
                this.limpiarFormulario();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al actualizar el vehículo.');
            });
        },
        limpiarFormulario() {
            this.codigo = '';
            this.marca = '';
            this.modelo = '';
            this.anio = '';
            this.precio = '';
            this.imagenSeleccionada = null;
            this.imagenUrlTemp = null;
            this.mostrarDatosProducto = false;
        }
    }
});

app.mount('#app');