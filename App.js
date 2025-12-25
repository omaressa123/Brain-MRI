import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePredict = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await axios.post(
        "http://localhost:5000/predict",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setResult(response.data.prediction);
      } else {
        setError(response.data.error || "Prediction failed");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const isTumorDetected = result && result.class === "yes";
  const confidencePercentage = result ? (result.confidence * 100).toFixed(2) : 0;

  return (
    <div className="app-container">
      <div className="main-card">
        <div className="header">
          <div className="header-icon">🧠</div>
          <h1 className="title">Brain Tumor Detection</h1>
          <p className="subtitle">AI-Powered MRI Analysis System</p>
        </div>

        <div className="upload-section">
          <label htmlFor="file-upload" className="file-upload-label">
            <div className="upload-area">
              <div className="upload-icon">📁</div>
              <div className="upload-text">
                {selectedFile ? (
                  <>
                    <strong>{selectedFile.name}</strong>
                    <span className="file-size">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </>
                ) : (
                  <>
                    <strong>Click to upload</strong> or drag and drop
                    <span className="file-hint">PNG, JPG, JPEG up to 10MB</span>
                  </>
                )}
              </div>
            </div>
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
          />
        </div>

        {preview && (
          <div className="preview-section">
            <h3 className="section-title">Image Preview</h3>
            <div className="image-container">
              <img
                src={preview}
                alt="MRI Preview"
                className="preview-image"
              />
            </div>
          </div>
        )}

        <button
          onClick={handlePredict}
          disabled={!selectedFile || loading}
          className={`predict-button ${loading ? 'loading' : ''} ${!selectedFile ? 'disabled' : ''}`}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Analyzing...
            </>
          ) : (
            <>
              🔍 Analyze Image
            </>
          )}
        </button>

        {error && (
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <strong>Error</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className={`result-card ${isTumorDetected ? 'tumor-detected' : 'no-tumor'}`}>
            <div className="result-header">
              <div className={`result-icon ${isTumorDetected ? 'tumor-icon' : 'healthy-icon'}`}>
                {isTumorDetected ? '⚠️' : '✅'}
              </div>
              <div className="result-title-section">
                <h2 className="result-title">
                  {isTumorDetected ? 'Tumor Detected' : 'No Tumor Detected'}
                </h2>
                <p className="result-subtitle">
                  {isTumorDetected 
                    ? 'Medical attention recommended' 
                    : 'Brain scan appears normal'}
                </p>
              </div>
            </div>

            <div className="confidence-section">
              <div className="confidence-label">Confidence Level</div>
              <div className="confidence-bar-container">
                <div 
                  className={`confidence-bar ${isTumorDetected ? 'tumor-bar' : 'healthy-bar'}`}
                  style={{ width: `${confidencePercentage}%` }}
                >
                  <span className="confidence-text">{confidencePercentage}%</span>
                </div>
              </div>
            </div>

            <div className="probabilities-section">
              <h3 className="probabilities-title">Detailed Analysis</h3>
              <div className="probabilities-grid">
                {Object.entries(result.probabilities)
                  .sort(([, a], [, b]) => b - a)
                  .map(([class_name, prob]) => {
                    const percentage = (prob * 100).toFixed(2);
                    const isTopClass = class_name === result.class;
                    return (
                      <div 
                        key={class_name} 
                        className={`probability-item ${isTopClass ? 'highlighted' : ''}`}
                      >
                        <div className="probability-header">
                          <span className="probability-label">
                            {class_name === 'yes' ? 'Tumor Present' : 'No Tumor'}
                          </span>
                          <span className="probability-value">{percentage}%</span>
                        </div>
                        <div className="probability-bar-wrapper">
                          <div 
                            className={`probability-bar ${class_name === 'yes' ? 'tumor-prob' : 'healthy-prob'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="result-footer">
              <div className="disclaimer">
                ⚠️ <strong>Disclaimer:</strong> This is an AI-assisted tool. Always consult with a qualified medical professional for diagnosis.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

