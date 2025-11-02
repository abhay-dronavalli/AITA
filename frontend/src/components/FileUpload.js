import React, { useState } from "react";
import "./FileUpload.css";
import UploadIcon from '../assets/upload-icon.png';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF files are allowed.');
        setFile(null); // Clear invalid file
        return;
      }
      setFile(selectedFile);
      setMessage(''); // Clear prev success
      setError(''); // Clear prev error
      setProgress(0);
    }
  };

  const uploadFile = () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    // XMLHttpRequest for progress (wrapped as Promise for async feel)
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:5000/api/upload');

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      setUploading(false);
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          setMessage(response.message || 'Upload successful');
          setFile(null); // Clear input after success
        } catch (e) {
          setError('Invalid response from server');
        }
      } else {
        setError(`Upload failed: ${xhr.status} - ${xhr.responseText}`);
      }
    });

    xhr.addEventListener('error', () => {
      setUploading(false);
      setError('Network error during upload');
    });

    xhr.send(formData);
  };

  const buttonText = uploading ? 'Uploading...' : (file ? 'Upload File' : 'Select File');

  return (
    <div className="upload-container">
      <div className="upload-box">
        <h1>Upload Content Files</h1>
        <img src={UploadIcon} alt="Upload icon" className="upload-image" />

        <label
          htmlFor="fileInput"
          className="upload-button"
          onClick={file ? uploadFile : undefined} // Trigger upload if file selected
          style={{ cursor: uploading ? 'wait' : (file ? 'pointer' : 'pointer') }}
        >
          {buttonText}
        </label>
        <input
          id="fileInput"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden-input"
          disabled={uploading}
        />

        {file && <p className="file-name">{file.name}</p>}

        {uploading && progress > 0 && progress < 100 && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default FileUpload;