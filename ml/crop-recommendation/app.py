from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os
import json

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join(
    os.path.dirname(__file__), "crop_recommendation_model.joblib"
)

FEATURE_ORDER_PATH = os.path.join(
    os.path.dirname(__file__), "feature_order.json"
)

model = joblib.load(MODEL_PATH)

with open(FEATURE_ORDER_PATH, "r", encoding="utf-8") as file:
    FEATURE_ORDER = json.load(file)


@app.get("/health")
def health():
    return jsonify({
        "success": True,
        "message": "Crop Recommendation ML API is running"
    })


@app.post("/predict")
def predict():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    missing = [feature for feature in FEATURE_ORDER if feature not in data]

    if missing:
        return jsonify({
            "success": False,
            "message": "Missing required features",
            "missingFields": missing
        }), 400

    try:
        values = {feature: float(data[feature]) for feature in FEATURE_ORDER}
        input_data = pd.DataFrame([values], columns=FEATURE_ORDER)

        prediction = model.predict(input_data)[0]

        response = {
            "success": True,
            "recommendedCrop": str(prediction),
            "input": values
        }

        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(input_data)[0]
            ranked = sorted(
                zip(model.classes_, probabilities),
                key=lambda item: item[1],
                reverse=True
            )[:3]

            response["topRecommendations"] = [
                {
                    "crop": str(crop),
                    "probability": round(float(probability), 4)
                }
                for crop, probability in ranked
            ]

        return jsonify(response)

    except (TypeError, ValueError):
        return jsonify({
            "success": False,
            "message": "All prediction inputs must be numeric"
        }), 400

    except Exception as error:
        return jsonify({
            "success": False,
            "message": "Prediction failed",
            "error": str(error)
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
