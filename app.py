from flask import Flask, request, render_template, jsonify
import numpy as np
import cv2
from skimage.feature import local_binary_pattern
import joblib
from PIL import Image
import io

app = Flask(__name__)

# Load model Logistic Regression
model = joblib.load("logistic_regression_model.joblib")

# Kategori ikan
categories = ["ikan_bandeng", "ikan_tongkol", "ikan_kerisi", "ikan_selar"]

# Fungsi ekstraksi fitur
def extract_features(image):
    image = cv2.resize(image, (256, 256))  # Resize
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)  # Grayscale

    # Ekstraksi LBP
    lbp = local_binary_pattern(gray, 8, 1, method="uniform")
    lbp_hist, _ = np.histogram(lbp.ravel(), bins=np.arange(0, 11), range=(0, 10))
    lbp_hist = lbp_hist.astype("float") / (lbp_hist.sum() + 1e-6)

    # Ekstraksi Histogram Warna
    hist = cv2.calcHist([image], [0, 1, 2], None, (8, 8, 8), [0, 256, 0, 256, 0, 256])
    hist = cv2.normalize(hist, hist).flatten()

    return np.hstack([lbp_hist, hist]).reshape(1, -1)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    image = Image.open(io.BytesIO(file.read()))
    image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

    features = extract_features(image)
    prediction = model.predict(features)
    predicted_label = categories[prediction[0]]

    return jsonify({"prediction": predicted_label})

if __name__ == "__main__":
    app.run(debug=True)
