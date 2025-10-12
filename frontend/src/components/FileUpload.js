import React, { useState } from "react";
import "./FileUpload.css";
import UploadIcon from '../assets/upload-icon.png'

function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploaded(true);
    } else {
      setUploaded(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-box">
        <h1>Upload Content Files</h1>

         <img src={UploadIcon} alt="Upload icon" className="upload-image" />

        <label htmlFor="fileInput" className="upload-button">
          Select File
        </label>
        <input
          id="fileInput"
          type="file"
          onChange={handleFileChange}
          className="hidden-input"
        />

          {file && (
          <>
            <p className="file-name">{file.name}</p>
            {uploaded && <p className="success-message">Upload Successful!</p>}
          </>
        )}
        </div>
    </div>
  );
}

export default FileUpload;
