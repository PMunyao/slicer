import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three';

function STLViewer({ url }) {
  const [geometry, setGeometry] = useState(null);

  useEffect(() => {
    const loader = new STLLoader();
    loader.load(
      url,
      (geometry) => {
        setGeometry(geometry);
      },
      undefined,
      (error) => {
        console.error("Error loading STL file:", error);
      }
    );
  }, [url]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="gray" />
    </mesh>
  );
}

function ModelUploader() {
  const [modelFile, setModelFile] = useState(null);
  const [modelUrl, setModelUrl] = useState(null);
  const [error, setError] = useState(null);
  const [printParams, setPrintParams] = useState({
    layerHeight: '',
    printSpeed: '',
    temperature: '',
  });
  const [slicedFileUrl, setSlicedFileUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setModelFile(file);
  };

  const handlePrintParamChange = (e) => {
    const { name, value } = e.target;
    setPrintParams((prevParams) => ({
      ...prevParams,
      [name]: value,
    }));
  };

  const handleUpload = async () => {
    if (!modelFile) {
      setError("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", modelFile);

    try {
      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setModelUrl(data.mesh_url);
        setError(null);
      } else {
        const errData = await response.json();
        setError(errData.error || "Upload failed.");
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("An unexpected error occurred.");
    }
  };

  const handleSlice = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/slice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config: printParams,
          stl_url: modelUrl,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSlicedFileUrl(data.gcode_url);
      } else {
        const errData = await response.json();
        setError(errData.error || "Slicing failed.");
      }
    } catch (err) {
      console.error("Error slicing file:", err);
      setError("An unexpected error occurred during slicing.");
    }
  };

  return (
    <div>
      <h1>3D Model Uploader</h1>
      <input type="file" accept=".stl" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!modelFile}>
        Upload and View
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {modelUrl && (
        <div style={{ width: "100%", height: "500px", marginTop: "20px" }}>
          <h2>STL Viewer</h2>
          <Canvas>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <OrbitControls />
            <STLViewer url={modelUrl} />
          </Canvas>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <h2>Print Parameters</h2>
        <form>
          <label>
            Layer Height:
            <input
              type="text"
              name="layerHeight"
              value={printParams.layerHeight}
              onChange={handlePrintParamChange}
            />
          </label>
          <br />
          <label>
            Print Speed:
            <input
              type="text"
              name="printSpeed"
              value={printParams.printSpeed}
              onChange={handlePrintParamChange}
            />
          </label>
          <br />
          <label>
            Temperature:
            <input
              type="text"
              name="temperature"
              value={printParams.temperature}
              onChange={handlePrintParamChange}
            />
          </label>
        </form>
        <button onClick={handleSlice} disabled={!modelUrl}>
          Slice Model
        </button>

        {slicedFileUrl && (
          <div>
            <h3>Download Gcode File</h3>
            <a href={slicedFileUrl} download>
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModelUploader;
