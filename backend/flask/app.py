from flask import Flask, request, jsonify
import os
from stl import Mesh
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

TMP_DIR = "/tmp"

# Ensure TMP_DIR exists
if not os.path.exists(TMP_DIR):
    os.makedirs(TMP_DIR)

@app.route('/upload', methods=['POST'])
def upload_model():
    try:
        # Check if a file is in the request
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request."}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected for upload."}), 400

        # Save the STL file
        file_path = os.path.join(TMP_DIR, file.filename)
        file.save(file_path)

        # Optionally process the STL file (e.g., validate or analyze it)
        mesh = Mesh.from_file(file_path)

        # Return the uploaded file path for the frontend to fetch
        return jsonify({"mesh_url": f"http://127.0.0.1:5000/uploads/{file.filename}"})
    except Exception as e:
        print(f"Error processing STL file: {e}")
        return jsonify({"error": str(e)}), 500

# Serve uploaded files
@app.route('/uploads/<filename>', methods=['GET'])
def serve_uploaded_file(filename):
    file_path = os.path.join(TMP_DIR, filename)
    if os.path.exists(file_path):
        return open(file_path, "rb").read(), 200, {
            'Content-Type': 'application/vnd.ms-pkistl',
            'Content-Disposition': f'attachment; filename="{filename}"'
        }
    return jsonify({"error": "File not found"}), 404

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
