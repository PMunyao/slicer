import React, { useState, useEffect } from'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function ModelUploader() {
  const [modelFile, setModelFile] = useState(null);
  const [modelMesh, setModelMesh] = useState(null);
  const [printParams, setPrintParams] = useState({});
  const [sliceEnabled, setSliceEnabled] = useState(false);

  const handleFileChange = (event) => {
    setModelFile(event.target.files <sup> </sup>);
  };

  const handleUpload = () => {
    // Upload the model file to the Flask backend
    fetch('/upload', {
      method: 'POST',
      body: new FormData(event.target),
    })
    .then((response) => response.json())
    .then((data) => {
        // Set the model mesh and enable slice button
        setModelMesh(data.modelMesh);
        setSliceEnabled(true);
      })
    .catch((error) => console.error(error));
  };

  const handlePrintParamChange = (event) => {
    setPrintParams((prevParams) => ({...prevParams, [event.target.name]: event.target.value }));
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
              Layer Height:
              <input type="number" name="layerHeight" value={printParams.layerHeight} onChange={handlePrintParamChange} />
            </label>
            <label>
              Infill Density:
              <input type="number" name="infillDensity" value={printParams.infillDensity} onChange={handlePrintParamChange} />
            </label>
            {/* Add more print parameters as needed */}
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
