from flask import Flask, request, render_template, jsonify
import numpy as np
import cv2
from skimage.feature import local_binary_pattern
import joblib
from PIL import Image
import io

app = Flask(__name__)

# Load model
model = joblib.load("logistic_regression_model.joblib")

# Label asli (tanpa LabelEncoder)
categories = ["ikan_bandeng", "ikan_tongkol", "ikan_kerisi", "ikan_selar"]

# Ekstraksi HSV Histogram (Range channel sesuai OpenCV)
def extract_color_histogram_hsv(image, bins=(8, 8, 8)):
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    hist = cv2.calcHist([hsv], [0, 1, 2], None, bins,
                        [0, 180, 0, 256, 0, 256])  # ✅ Range benar
    hist = cv2.normalize(hist, hist).flatten()
    return hist

# Ekstraksi LBP
def extract_lbp_features(image, P=8, R=1):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    lbp = local_binary_pattern(gray, P, R, method='uniform')
    (hist, _) = np.histogram(lbp.ravel(), bins=np.arange(0, P + 3),
                             range=(0, P + 2))
    hist = hist.astype("float")
    hist /= (hist.sum() + 1e-7)
    return hist

# Ekstraksi Kombinasi
def extract_features(image):
    image = cv2.resize(image, (128, 128))  # ✅ Ukuran sesuai training
    hist_color = extract_color_histogram_hsv(image)
    hist_lbp = extract_lbp_features(image)
    combined = np.concatenate([hist_color, hist_lbp])
    return combined.reshape(1, -1)

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

    try:
        image = Image.open(io.BytesIO(file.read())).convert("RGB")
        image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    except Exception as e:
        return jsonify({"error": f"Gagal membaca gambar: {str(e)}"}), 400

    features = extract_features(image)
    prediction = model.predict(features)
    predicted_label = prediction[0]

    return jsonify({"prediction": predicted_label})

if __name__ == "__main__":
    app.run(debug=True)
