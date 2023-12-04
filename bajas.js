const URL = "https://mauropy.pythonanywhere.com/";
const app = Vue.createApp({
  data() {
    return {
      productos: [],
    };
  },
  methods: {
    obtenerProductos() {
      // Obtenemos el contenido del inventario
      fetch(URL + "vehiculo")
        .then((response) => {
          // Parseamos la respuesta JSON
          if (response.ok) {
            return response.json();
          }
        })
        .then((data) => {
          // El código Vue itera este elemento para generar la
          tabla;
          this.productos = data;
        })
        .catch((error) => {
          console.log("Error:", error);
          alert("Error al obtener los vehículos.");
        });
    },
    eliminarProducto(codigo) {
      if (confirm("¿Estás seguro de que quieres eliminar este vehículo?")) {
        fetch(URL + `vehiculos/${codigo}`, { method: "DELETE" })
          .then((response) => {
            if (response.ok) {
              this.vehiculos = this.vehiculos.filter(
                (vehiculo) => vehiculo.codigo !== codigo
              );
              alert("Vehiculo eliminado correctamente.");
            }
          })
          .catch((error) => {
            alert(error.message);
          });
      }
    },
  },
  mounted() {
    //Al cargar la página, obtenemos la lista de vehículos
    this.obtenerVehiculos();
  },
});
app.mount("body");
