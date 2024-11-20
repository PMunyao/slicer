import React, { useState } from'react';
import { useThree } from '@react-three/fiber';

function ModelUploader() {
  const [modelFile, setModelFile] = useState(null);
  const [modelMesh, setModelMesh] = useState(null);

  const handleFileChange = (event) => {
    setModelFile(event.target.files <sup> </sup>);
  };

  const handleUpload = () => {
    // Upload the model file to the Flask backend
    fetch('/slice', {
      method: 'POST',
      body: new FormData(event.target),
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
        <button onClick={handleUpload}>Upload and Slice</button>
      )}
      {modelMesh && (
        <mesh ref={modelMesh} position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="hotpink" />
        </mesh>
      )}
    </div>
  );
}

export default ModelUploader;
