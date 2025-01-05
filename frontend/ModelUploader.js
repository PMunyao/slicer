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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setModelFile(file);
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
        setModelUrl(data.mesh_url); // Backend provides mesh URL
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
    </div>
  );
}

export default ModelUploader;
