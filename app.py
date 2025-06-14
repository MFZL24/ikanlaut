from flask import Flask, request, render_template, jsonify
import numpy as np
import cv2
from PIL import Image
import io
import joblib
from skimage.feature import local_binary_pattern

app = Flask(__name__)

# Load model dan label encoder
model = joblib.load("logistic_regression_model.joblib")
label_encoder = joblib.load("label_encoder.pkl")

# Fungsi ekstraksi fitur sesuai model (522 fitur)
def extract_color_histogram(image, bins=(8, 8, 8)):
    hist = cv2.calcHist([image], [0, 1, 2], None, bins,
                        [0, 256, 0, 256, 0, 256])
    hist = cv2.normalize(hist, hist).flatten()
    return hist

def extract_lbp_features(image, P=8, R=1):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    lbp = local_binary_pattern(gray, P, R, method='uniform')
    (hist, _) = np.histogram(lbp.ravel(), bins=np.arange(0, P + 3),
                             range=(0, P + 2))
    hist = hist.astype("float")
    hist /= (hist.sum() + 1e-7)
    return hist

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Baca dan preproses gambar
        image = Image.open(io.BytesIO(file.read())).convert('RGB')
        image = np.array(image)
        image = cv2.resize(image, (128, 128))

        # Ekstraksi fitur
        color_hist = extract_color_histogram(image)  # 512
        lbp_hist = extract_lbp_features(image)       # 10
        combined = np.concatenate([color_hist, lbp_hist])  # 522 fitur

        # Tambah 13 nilai nol agar jumlah fitur 535 (sementara)
        if combined.shape[0] < 535:
            padding = np.zeros(535 - combined.shape[0])
            combined = np.concatenate([combined, padding])

        # Prediksi
        prediction_encoded = model.predict([combined])[0]
        prediction_label = label_encoder.inverse_transform([prediction_encoded])[0]

        return jsonify({'prediction': prediction_label})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
