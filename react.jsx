import { useState } from "react";
import axios from "axios";

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

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Brain Tumor Detection</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ marginBottom: "10px" }}
        />
      </div>

      {preview && (
        <div style={{ marginBottom: "20px" }}>
          <img
            src={preview}
            alt="Preview"
            style={{ maxWidth: "100%", maxHeight: "300px", border: "1px solid #ccc" }}
          />
        </div>
      )}

      <button
        onClick={handlePredict}
        disabled={!selectedFile || loading}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading || !selectedFile ? "not-allowed" : "pointer",
          opacity: loading || !selectedFile ? 0.6 : 1
        }}
      >
        {loading ? "Predicting..." : "Predict"}
      </button>

      {error && (
        <div style={{ marginTop: "20px", color: "red", padding: "10px", backgroundColor: "#ffe6e6", borderRadius: "4px" }}>
          Error: {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f0f0f0", borderRadius: "4px" }}>
          <h3>Prediction Result:</h3>
          <p><strong>Class:</strong> {result.class}</p>
          <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%</p>
          <div>
            <strong>Probabilities:</strong>
            <ul>
              {Object.entries(result.probabilities).map(([class_name, prob]) => (
                <li key={class_name}>
                  {class_name}: {(prob * 100).toFixed(2)}%
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
