# Brain-MRI
# Brain Tumor Detection Application

A Flask + React application for detecting brain tumors from MRI images using YOLOv8 classification model.

## Project Structure

```
flask_with_react/
├── flask_api.py          # Flask backend API
├── ai_model.py           # AI model loading and prediction logic
├── brain_tumor_classifier.pt  # Trained YOLOv8 model
├── requirements.txt      # Python dependencies
├── package.json          # Node.js dependencies
├── public/               # React public files
│   └── index.html
├── src/                  # React source files
│   ├── App.js
│   ├── index.js
│   └── index.css
└── build/                # Built React app (created after building)
```

## Setup Instructions

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Install Node.js Dependencies

Make sure you have Node.js installed (version 14 or higher).

```bash
npm install
```

### 3. Build React App

Build the React app for production:

```bash
npm run build
```

This will create a `build` folder with the production-ready React app.

### 4. Run Flask Server

```bash
python flask_api.py
```

The Flask server will start on `http://localhost:5000` and serve both:
- The React frontend (from the `build` folder)
- The API endpoint at `/predict`

## Development Mode

If you want to develop the React app with hot-reloading:

### Terminal 1 - React Development Server:
```bash
npm start
```
This runs React on `http://localhost:3000`

### Terminal 2 - Flask API Server:
```bash
python flask_api.py
```
This runs Flask on `http://localhost:5000`

**Note:** In development, you may need to update the API URL in `src/App.js` to point to `http://localhost:5000/predict` (it already does).

## Usage

1. Start the Flask server
2. Open `http://localhost:5000` in your browser
3. Upload a brain MRI image
4. Click "Predict" to get the tumor detection result

## API Endpoints

- `GET /` - Serves the React app
- `POST /predict` - Accepts image file and returns prediction
- `GET /health` - Health check endpoint

## Model

The application uses a YOLOv8 classification model trained on brain MRI images. The model classifies images into two categories:
- **yes**: Tumor detected
- **no**: No tumor detected

