from flask import Flask, request, jsonify
import subprocess
import os
import trimesh
from stl import mesh

app = Flask(__name__)

# Set the path to the Slic3r Docker image
SLICER_IMAGE = "slic3r:latest"

# Set the path to the Bambu CLI Docker image
BAMBU_IMAGE = "bambu-cli:latest"

# Set the path to the temporary directory for storing model files
TMP_DIR = "/tmp"

# Default config.ini template
CONFIG_TEMPLATE = """
[general]
bed_temperature = {bed_temperature}
extrusion_temperature = {extrusion_temperature}
layer_height = {layer_height}
infill_density = {infill_density}
support_material = {support_material}
"""

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

    # Generate the config.ini file
    config_file = os.path.join(TMP_DIR, "config.ini")
    with open(config_file, "w") as f:
        f.write(CONFIG_TEMPLATE.format(**print_params))

    # Create a dictionary of Slic3r command-line arguments
    slic3r_args = {
        "input": os.path.join(TMP_DIR, "input.stl"),
        "output": os.path.join(TMP_DIR, "output.gcode"),
        "config": config_file,
    }

    # Run the Slic3r command using the Docker image
    slic3r_cmd = f"slic3r --{'--'.join(f'{k}={v}' for k, v in slic3r_args.items())}"
    subprocess.run(["docker", "run", "-v", f"{TMP_DIR}:/tmp", SLICER_IMAGE, "bash", "-c", slic3r_cmd])

    # Return the sliced G-code file
    with open(os.path.join(TMP_DIR, "output.gcode"), "r") as f:
        gcode = f.read()
    return jsonify({"gcode": gcode})

@app.route("/print", methods=["POST"])
def print_model():
    # Get the sliced G-code from the request
    gcode = request.json["gcode"]

    # Save the G-code file to a temporary directory
    gcode_path = os.path.join(TMP_DIR, "output.gcode")
    with open(gcode_path, "w") as f:
        f.write(gcode)

    # Run the Bambu CLI command using the Docker image
    bambu_cmd = f"bambu-cli print {gcode_path}"
    subprocess.run(["docker", "run", "-v", f"{TMP_DIR}:/tmp", BAMBU_IMAGE, "bash", "-c", bambu_cmd])

    # Return a success message
    return jsonify({"message": "Print job sent to printer"})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
