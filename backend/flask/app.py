from flask import Flask, request, jsonify
import subprocess
import os
import trimesh
from stl import mesh

app = Flask(__name__)

# Set the path to the Slic3r Docker image
SLICER_IMAGE = "slic3r:latest"

# Set the path to the temporary directory for storing model files
TMP_DIR = "/tmp"

@app.route("/upload", methods=["POST"])
def upload_model():
    # Get the model file from the request
    model_file = request.files["model"]

    # Save the model file to a temporary directory
    model_path = os.path.join(TMP_DIR, model_file.filename)
    model_file.save(model_path)

    # Load the STL mesh
    mesh = trimesh.load(model_path)

    # Get the mesh data
    mesh_data = mesh.export('obj')

    # Return the mesh data
    return jsonify({"mesh": mesh_data})

@app.route("/slice", methods=["POST"])
def slice_model():
    # Get the print parameters from the request
    print_params = request.get_json()

    # Create a dictionary of Slic3r command-line arguments
    slic3r_args = {
        "input": os.path.join(TMP_DIR, "input.stl"),
        "output": os.path.join(TMP_DIR, "output.gcode"),
        "config": "/app/Slic3r/config.ini",  # assumes config.ini is in the Slic3r container
    }
    slic3r_args.update(print_params)

    # Run the Slic3r command using the Docker image
    slic3r_cmd = f"slic3r --{'--'.join(f'{k}={v}' for k, v in slic3r_args.items())}"
    subprocess.run(["docker", "run", "-v", f"{TMP_DIR}:/tmp", SLICER_IMAGE, "bash", "-c", slic3r_cmd])

    # Return the sliced G-code file
    with open(os.path.join(TMP_DIR, "output.gcode"), "r") as f:
        gcode = f.read()
    return jsonify({"gcode": gcode})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
