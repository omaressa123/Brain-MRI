import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from ai_model import predict, load_model

app = Flask(__name__, static_folder='./build', static_url_path='/')
CORS(app)  # Enable CORS for React

# Allowed image extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Load the AI model when the Flask app starts
try:
    with app.app_context():
        load_model("brain_tumor_classifier.pt")
        print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")

@app.route("/")
def serve_react_app():
    if os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
    return jsonify({"message": "React app not built. Please build the React app first."})

@app.route("/predict", methods=["POST"])
def make_prediction():
    try:
        # Check if image file is in the request
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type. Allowed types: PNG, JPG, JPEG, GIF, BMP"}), 400
        
        # Reset file pointer to beginning
        file.seek(0)
        
        # Make prediction
        result = predict(file)
        
        return jsonify({
            "success": True,
            "prediction": result
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    try:
        from ai_model import get_model
        get_model()
        return jsonify({"status": "healthy", "model": "loaded"})
    except:
        return jsonify({"status": "unhealthy", "model": "not loaded"}), 503

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
