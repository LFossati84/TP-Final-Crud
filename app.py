import mysql.connector
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os, time

app = Flask(__name__)
CORS(app)

class Catalogo:
    def __init__(self, host, user, password, database):
        self.conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
        )
        
        self.cursor = self.conn.cursor()
        try:
            self.cursor.execute(f"USE {database}")
        except mysql.connector.Error as err:
            # Si la base de datos no existe, la creamos
            if err.errno == mysql.connector.errorcode.ER_BAD_DB_ERROR:
                self.cursor.execute(f"CREATE DATABASE {database}")
                self.conn.database = database
            else:
                raise err

        self.cursor.execute('''CREATE TABLE IF NOT EXISTS vehiculos (
            Codigo INT,
            Marca VARCHAR(30) NOT NULL,
            Modelo VARCHAR(255) NOT NULL,
            Año INT NOT NULL,
            Precio DECIMAL (10,2) NOT NULL,
            Foto VARCHAR (255))''')
        self.conn.commit()
        self.cursor.close()
        self.cursor = self.conn.cursor(dictionary=True)

        
    def agregar_vehiculo(self, codigo, marca, modelo, anio, precio, foto):
        self.cursor.execute(f"SELECT * FROM vehiculos WHERE codigo = {codigo}")
        vehiculo_existe = self.cursor.fetchone()
        if vehiculo_existe:
            return False
        
        sql = f"INSERT INTO vehiculos (codigo, marca, modelo, anio, precio, foto) VALUES ({codigo}, '{marca}', '{modelo}', {anio}, {precio}, '{foto}')"
        self.cursor.execute(sql)
        self.conn.commit()
        return True
        # agregar_vehiculo() original
        # if self.consultar_vehiculo(codigo):
        #     print("No se completo la carga, el vehículo fue registrado anteriormente")
        #     return False
        
        # nuevo_vehiculo = {
        #     'codigo': codigo,
        #     'marca': marca,
        #     'modelo': modelo,
        #     'anio': anio,
        #     'precio': precio,
        #     'foto': foto
        # }
        # self.vehiculos.append(nuevo_vehiculo)
        # print("Vehículo registrado exitosamente")
        # return True

    def consultar_vehiculo(self, codigo):
        self.cursor.execute(f"SELECT * FROM vehiculos WHERE codigo = {codigo}")
        return self.cursor.fetchone()

        # consultar_vehiculo() original
        # for vehiculo in self.vehiculos:
        #     if vehiculo['codigo'] == codigo:
        #         return vehiculo
        # return False

    def modificar_vehiculo(self, codigo, nueva_marca, nuevo_modelo, nuevo_anio, nuevo_precio, nueva_foto):
        sql = f"UPDATE vehiculos SET marca = '{nueva_marca}', modelo = '{nuevo_modelo}', anio = {nuevo_anio}, precio = {nuevo_precio}, foto = '{nueva_foto}' WHERE Codigo = {codigo}"
        self.cursor.execute(sql)
        self.conn.commit()
        self.cursor.rowcount > 0

        # modificar_vehiculo() original        
        # for vehiculo in self.vehiculos:
        #     if vehiculo['codigo'] == codigo:
        #         vehiculo['marca'] = nueva_marca
        #         vehiculo['modelo'] = nuevo_modelo
        #         vehiculo['anio'] = nuevo_anio
        #         vehiculo['precio'] = nuevo_precio
        #         vehiculo['foto'] = nueva_foto
        #         print("Información modificada exitosamente")
        #         return True
        # print("Vehículo no encontrado")
        # return False

    def listar_vehiculos(self):
        self.cursor.execute("SELECT * FROM vehiculos")
        vehiculos = self.cursor.fetchall()
        return vehiculos
        
        print("-" * 30)
        for vehiculo in vehiculos:
            print(f"    Codigo: {vehiculo['Codigo']}")
            print(f"     Marca: {vehiculo['Marca']}")
            print(f"    Modelo: {vehiculo['Modelo']}")
            print(f"       Año: {vehiculo['Año']}")
            print(f"    Precio: {vehiculo['Precio']}")
            print(f"      Foto: {vehiculo['Foto']}")
            print("-" * 30)

    def eliminar_vehiculo(self, codigo):
        self.cursor.execute(f"DELETE FROM vehiculos WHERE codigo = {codigo}")
        self.conn.commit()
        return self.cursor.rowcount > 0
        
        # eliminar_vehiculo() original
        # for vehiculo in self.vehiculos:
        #     if vehiculo['codigo'] == codigo:
        #         self.vehiculos.remove(vehiculo)
        #         print("El vehículo ha sido eliminado")
        #         return True
        # print("Vehículo no encontrado")
        # return False

    def mostrar_vehiculo(self, codigo):
        self.cursor.execute(f"SELECT * FROM vehiculos WHERE codigo = {codigo}")
        vehiculo = self.cursor.fetchone()
        if vehiculo:
            print("-" * 30)
            print(f"    Codigo: {vehiculo['codigo']}")
            print(f"     Marca: {vehiculo['marca']}")
            print(f"    Modelo: {vehiculo['modelo']}")
            print(f"       Año: {vehiculo['anio']}")
            print(f"    Precio: {vehiculo['precio']}")
            print(f"      Foto: {vehiculo['foto']}")
            print("-" * 30)
        else:
            print("Vehículo no encontrado.")

# Crear una instancia de la clase catalogo
catalogo = Catalogo(host='mauropy.mysql.pythonanywhere-services.com', user='mauropy', password='passDataBase', database='mauropy$app_concesionaria')

# Carpeta para guardar las imagenes
ruta_destino = '/home/home/mauropy/mysite/static/img/'

# Listar Vehiculos
@app.route('/vehiculos', methods={'GET'})
def listar_vehiculos():
    vehiculos = catalogo.listar_vehiculos()
    return jsonify(vehiculos)

# Ruta Mostrar Vehiculo
@app.route("/vehiculos/<int:codigo>", methods=["GET"])
def mostrar_vehiculo(codigo):
    vehiculo = catalogo.consultar_vehiculo(codigo)
    if vehiculo:
        return jsonify(vehiculo)
    else:
        return "Vehículo no encontrado", 404

# Ruta Agregar Vehiculo    
@app.route("/vehiculos", methods=["POST"])
def agregar_vehiculo():
    # Recojo los datos del form
    codigo = request.form['codigo']
    marca = request.form['marca']
    modelo = request.form['modelo']
    anio = request.form['anio']
    precio = request.form['precio']
    foto = request.files['foto']
    nombre_imagen = secure_filename(foto.filename)

    nombre_base, extension = os.path.splitext(nombre_imagen)
    nombre_imagen = f"{nombre_base}_{int(time.time())}{extension}"
    foto.save(os.path.join(ruta_destino, nombre_imagen))

    if catalogo.agregar_vehiculo(codigo, marca, modelo, anio, precio, nombre_imagen):
        return jsonify({"mensaje": "Vehículo agregado"}), 201
    else:
        return jsonify({"mensaje": "No se completo la carga, el vehículo fue registrado anteriormente"}), 400

@app.route("/vehiculos/<int:codigo>", methods=["PUT"])
def modificar_vehiculo(codigo):
    # Recojo los datos del form
    nueva_marca = request.form.get("marca")
    nuevo_modelo = request.form.get("modelo")
    nuevo_anio = request.form.get("anio")
    nuevo_precio = request.form.get("precio")
    # Procesamiento de la imagen
    foto = request.files['foto']
    nombre_imagen = secure_filename(foto.filename)
    nombre_base, extension = os.path.splitext(nombre_imagen)
    nombre_imagen = f"{nombre_base}_{int(time.time())}{extension}"
    foto.save(os.path.join(ruta_destino, nombre_imagen))
    
    # Actualización del vehículo
    if catalogo.modificar_vehiculo(codigo, nueva_marca, nuevo_modelo, nuevo_anio, nuevo_precio, nombre_imagen):
        return jsonify({"mensaje": "Datos de vehículo modificado"}), 200
    else:
        return jsonify({"mensaje": "Vehículo no encontrado"}), 404

@app.route("/vehiculos/<int:codigo>", methods=["DELETE"])
def eliminar_vehiculo(codigo):
    # Primero, obtén la información del producto para encontrar la imagen
    vehiculo = catalogo.consultar_vehiculo(codigo)
    if vehiculo:
        # Eliminar la imagen asociada si existe
        ruta_imagen = os.path.join(ruta_destino, vehiculo['foto'])
        if os.path.exists(ruta_imagen):
            os.remove(ruta_imagen)
        # Luego, elimina el producto del catálogo
        if catalogo.eliminar_vehiculo(codigo):
            return jsonify({"mensaje": "Vehículo eliminado"}), 200
        else:
            return jsonify({"mensaje": "Error al eliminar el vehículo"}), 500
    else:
        return jsonify({"mensaje": "Vehículo no encontrado"}), 404

if __name__ == "__main__":
    app.run(debug=True)

# catalogo.agregar_vehiculo(1, 'Fiat', 'Palio 1.6', 2015, 4999999.99, 'palio.jpg')
# catalogo.agregar_vehiculo(2, 'Renault', 'Megane 2.0', 2009, 3999999.99, 'megane.jpg')
# agregar_vehiculo(2, 'Renault', 'Megane 2.0', 2009, 3999999.99, 'megane.jpg') # probamos que no agruegue codigo duplicado
# catalogo.agregar_vehiculo(3, 'Ford', 'Fiesta 1,6T', 2017, 6000000.00, 'fiesta.jpg')
# listar_vehiculos()
# catalogo.eliminar_vehiculo(3)
# catalogo.modificar_vehiculo(1, 'Fiat', 'Palio 1.3', 2015, 4999999.99, 'palio.jpg')
# catalogo.listar_vehiculos()

# catalogo.mostrar_vehiculo(8)
# catalogo.consultar_vehiculo(1)

# catalogo.mostrar_vehiculo(3)
# catalogo.mostrar_vehiculo(8)