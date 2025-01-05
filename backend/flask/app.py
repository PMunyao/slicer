from flask import Flask, request, jsonify
import os
from stl import Mesh
from flask_cors import CORS
import subprocess
import json

app = Flask(__name__)
CORS(app)

TMP_DIR = "/tmp"
GCODE_DIR = "/tmp/gcode"

# Ensure TMP_DIR exists
if not os.path.exists(TMP_DIR):
    os.makedirs(TMP_DIR)
if not os.path.exists(GCODE_DIR):
    os.makedirs(GCODE_DIR)

@app.route('/upload', methods=['POST'])
def upload_model():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request."}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected for upload."}), 400

        file_path = os.path.join(TMP_DIR, file.filename)
        file.save(file_path)

        # Optionally process the STL file
        mesh = Mesh.from_file(file_path)

        return jsonify({"mesh_url": f"http://127.0.0.1:5000/uploads/{file.filename}"})
    except Exception as e:
        print(f"Error processing STL file: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/uploads/<filename>', methods=['GET'])
def serve_uploaded_file(filename):
    file_path = os.path.join(TMP_DIR, filename)
    if os.path.exists(file_path):
        return open(file_path, "rb").read(), 200, {
            'Content-Type': 'application/vnd.ms-pkistl',
            'Content-Disposition': f'attachment; filename="{filename}"'
        }
    return jsonify({"error": "File not found"}), 404

@app.route('/slice', methods=['POST'])
def slice_model():
    try:
        data = request.get_json()
        print_params = data.get("config")
        stl_url = data.get("stl_url")

        # Download the STL file (assuming it's publicly available)
        stl_filename = stl_url.split('/')[-1]
        stl_file_path = os.path.join(TMP_DIR, stl_filename)
        # (Here, you would need logic to download the STL file from the provided URL)

        # Save the print parameters as a config file
        config_filename = f"config_{stl_filename}.json"
        config_path = os.path.join(TMP_DIR, config_filename)
        with open(config_path, "w") as config_file:
            json.dump(print_params, config_file)

        # Call the slicing process in the Docker container (you'll need to adjust this)
        command = [
            "docker", "run", "--rm", 
            "-v", f"{stl_file_path}:/model.stl",
            "-v", f"{config_path}:/config.json",
            "-v", f"{GCODE_DIR}:/output",
            "bambu-labs-slicer", 
            "--stl", "/model.stl", 
            "--config", "/config.json",
            "--output", "/output"
        ]
        subprocess.run(command, check=True)

        # Assuming the sliced file is saved in the output directory
        gcode_filename = f"{stl_filename}.gcode"
        gcode_url = f"http://127.0.0.1:5000/uploads/{gcode_filename}"

        return jsonify({"gcode_url": gcode_url})
    except Exception as e:
        print(f"Error during slicing: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
