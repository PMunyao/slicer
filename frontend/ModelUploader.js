import React, { useState, useEffect } from'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function ModelUploader() {
  const [modelFile, setModelFile] = useState(null);
  const [modelMesh, setModelMesh] = useState(null);
  const [printParams, setPrintParams] = useState({
    bed_temperature: 60,
    extrusion_temperature: 200,
    layer_height: 0.2,
    infill_density: 20,
    support_material: 'grid',
  });
  const [sliceEnabled, setSliceEnabled] = useState(false);

  const handleFileChange = (event) => {
    setModelFile(event.target.files <sup> </sup>);
  };

  const handlePrintParamChange = (event) => {
    setPrintParams((prevParams) => ({...prevParams, [event.target.name]: event.target.value }));
  };

  const handleUpload = () => {
    // Upload the model file to the Flask backend
    const formData = new FormData();
    formData.append('model', modelFile);
    fetch('/upload', {
      method: 'POST',
      body: formData,
    })
     .then((response) => response.json())
     .then((data) => {
        // Set the model mesh and enable slice button
        setModelMesh(data.mesh);
        setSliceEnabled(true);
      })
     .catch((error) => console.error(error));
  };

  const handleSlice = () => {
    // Send the print parameters to the Flask backend
    fetch('/slice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(printParams),
    })
     .then((response) => response.json())
     .then((data) => {
        // Display the sliced G-code file
        console.log(data.gcode);
      })
     .catch((error) => console.error(error));
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {modelFile && (
        <button onClick={handleUpload}>Upload and View</button>
      )}
      {modelMesh && (
        <div>
          <OrbitControls ref={modelMesh} position={[0, 0, 0]}>
            <mesh ref={modelMesh}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="hotpink" />
            </mesh>
          </OrbitControls>
          <form>
            <label>
              Bed Temperature:
              <input type="number" name="bed_temperature" value={printParams.bed_temperature} onChange={handlePrintParamChange} />
            </label>
            <label>
              Extrusion Temperature:
              <input type="number" name="extrusion_temperature" value={printParams.extrusion_temperature} onChange={handlePrintParamChange} />
            </label>
            <label>
              Layer Height:
              <input type="number" name="layer_height" value={printParams.layer_height} onChange={handlePrintParamChange} />
            </label>
            <label>
              Infill Density:
              <input type="number" name="infill_density" value={printParams.infill_density} onChange={handlePrintParamChange} />
            </label>
            <label>
              Support Material:
              <select name="support_material" value={printParams.support_material} onChange={handlePrintParamChange}>
                <option value="grid">Grid</option>
                <option value="lines">Lines</option>
              </select>
            </label>
            {sliceEnabled && (
              <button onClick={handleSlice}>Slice</button>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

export default ModelUploader;
