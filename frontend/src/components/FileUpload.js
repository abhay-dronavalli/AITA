import React, { useState } from 'react';

function FileUpload() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Handle file selection from input button
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      addFiles(files);
    }
  };

  // Add files to the list
  const addFiles = (newFiles) => {
    setSelectedFiles(prev => [...prev, ...newFiles]);
    uploadFiles();
  };

  // Remove a specific file
  const removeFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Handle drag over event
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  // Handle drag leave event
  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  // Handle file drop
  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      addFiles(files);
    }
  };

  // Uploads files (Unfinished)
  const uploadFiles = () => {
    setUploadSuccess(true);
  };

  // Reset the upload
  const handleReset = () => {
    setSelectedFiles([]);
    setUploadSuccess(false);
  };

  return (
    <div className="file-upload-container">
      <h2>Upload Your Files</h2>
      
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="drop-zone-content">
          <p className="drop-zone-text">
            Drag and drop your files here
          </p>
          <p className="drop-zone-or">or</p>
          <label htmlFor="file-input" className="file-select-button">
            Choose Files
          </label>
          <input
            id="file-input"
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <label htmlFor="folder-input" className="file-select-button">
            Choose Folder
          </label>
          <input
            id="folder-input"
            type="file"
            webkitdirectory=""
            directory=""
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="files-list">
          <h3>Selected Files ({selectedFiles.length})</h3>
          {selectedFiles.map((file, index) => (
            <div key={index} className="file-item">
              <div className="file-item-info">
                <p className="file-name">{file.name}</p>
                <p className="file-size">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button 
                onClick={() => removeFile(index)} 
                className="remove-button"
                aria-label="Remove file"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {uploadSuccess && selectedFiles.length > 0 && (
        <div className="success-message">
          ✓ {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} ready to upload!
        </div>
      )}

      {selectedFiles.length > 0 && (
        <button onClick={handleReset} className="reset-button">
          Clear All Files
        </button>
      )}
    </div>
  );
}

export default FileUpload;