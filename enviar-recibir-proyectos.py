from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import os
import uuid

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB

# Extensiones permitidas
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Crear la carpeta uploads si no existe
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Conexión a MongoDB Atlas
client = MongoClient("mongodb+srv://edwinjavierpa:1234@comidas.naznnua.mongodb.net/comidas?retryWrites=true&w=majority")
db = client["proyectos"]
proyectos_collection = db["proyecto"]

# Ruta para servir imágenes de la carpeta uploads
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Ruta para agregar un nuevo proyecto
@app.route('/api/proyectos', methods=['POST'])
def agregar_proyecto():
    titulo = request.form.get('titulo')
    descripcion = request.form.get('descripcion')
    imagenesPrincipales = []
    imagenesCarrusel = []

    # Guardar imágenes principales
    for file in request.files.getlist('imagenesPrincipales'):
        if file and allowed_file(file.filename):
            # Renombrar archivo
            extension = file.filename.rsplit('.', 1)[1].lower()
            filename = f"{uuid.uuid4().hex}.{extension}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            # Guardar la ruta pública
            imagenesPrincipales.append(f'http://localhost:3000/uploads/{filename}')
        else:
            return jsonify({'error': 'Tipo de archivo no permitido en imágenes principales'}), 400

    # Guardar imágenes del carrusel
    for file in request.files.getlist('imagenesCarrusel'):
        if file and allowed_file(file.filename):
            # Renombrar archivo
            extension = file.filename.rsplit('.', 1)[1].lower()
            filename = f"{uuid.uuid4().hex}.{extension}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            # Guardar la ruta pública
            imagenesCarrusel.append(f'http://localhost:3000/uploads/{filename}')
        else:
            return jsonify({'error': 'Tipo de archivo no permitido en imágenes carrusel'}), 400

    proyecto = {
        "imagenesPrincipales": imagenesPrincipales,
        "imagenesCarrusel": imagenesCarrusel,
        "titulo": titulo,
        "descripcion": descripcion
    }

    try:
        resultado = proyectos_collection.insert_one(proyecto)
        proyecto["_id"] = str(resultado.inserted_id)
        return jsonify(proyecto), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ruta para obtener todos los proyectos
@app.route('/api/proyectos', methods=['GET'])
def obtener_proyectos():
    proyectos = list(proyectos_collection.find())
    for proyecto in proyectos:
        proyecto["_id"] = str(proyecto["_id"])  # Convierte ObjectId a string para JSON
    return jsonify(proyectos)

# Ruta para eliminar un proyecto
@app.route('/api/proyectos/<id>', methods=['DELETE'])
def eliminar_proyecto(id):
    try:
        resultado = proyectos_collection.delete_one({"_id": ObjectId(id)})
        if resultado.deleted_count == 1:
            return jsonify({"mensaje": "Proyecto eliminado exitosamente"}), 200
        else:
            return jsonify({"error": "Proyecto no encontrado"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=3000, debug=True)
