import os
from ultralytics import YOLO
from PIL import Image
import io

_model = None

def load_model(model_path="brain_tumor_classifier.pt"):
    """Load the YOLOv8 classification model."""
    global _model
    if _model is None:
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        # Load YOLOv8 classification model
        _model = YOLO(model_path)
    return _model

def get_model():
    """Get the loaded model instance."""
    global _model
    if _model is None:
        raise Exception("AI model not loaded. Call load_model() first.")
    return _model

def predict(image_file):
    """
    Predict brain tumor from an image file.
    
    Args:
        image_file: File object or image path
        
    Returns:
        dict: Prediction result with class, confidence, and probabilities
    """
    model = get_model()
    
    # Convert file object to PIL Image if needed
    if hasattr(image_file, 'read'):
        # It's a file object (Flask file upload)
        image_file.seek(0)  # Reset file pointer to beginning
        image = Image.open(image_file)
        # Convert to RGB if necessary (handles RGBA, P, etc.)
        if image.mode != 'RGB':
            image = image.convert('RGB')
    elif isinstance(image_file, str):
        # It's a file path
        image = Image.open(image_file)
        if image.mode != 'RGB':
            image = image.convert('RGB')
    else:
        # Assume it's already a PIL Image or numpy array
        image = image_file
    
    # Run prediction using PIL Image
    results = model.predict(source=image, verbose=False)
    
    # Get first result (since we're predicting on a single image)
    result = results[0]
    
    # Get predicted class index and name
    pred_class_idx = result.probs.top1
    pred_class_name = result.names[pred_class_idx]
    confidence = float(result.probs.top1conf)
    
    # Get probabilities for all classes
    probabilities = {}
    for idx, class_name in result.names.items():
        probabilities[class_name] = float(result.probs.data[idx])
    
    return {
        "class": pred_class_name,
        "confidence": confidence,
        "probabilities": probabilities
    }
