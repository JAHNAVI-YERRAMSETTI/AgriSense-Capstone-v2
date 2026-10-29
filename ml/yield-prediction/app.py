from flask import Flask, request, jsonify
from flask_cors import CORS

import joblib
import pandas as pd
from pathlib import Path


# ============================================================
# Flask application
# ============================================================

app = Flask(__name__)
CORS(app)


# ============================================================
# Model
# ============================================================

MODEL_FILE = Path("yield_model_hgb.pkl")

model_package = None


def load_model():

    global model_package

    if not MODEL_FILE.exists():
        raise FileNotFoundError(
            f"Yield model not found: {MODEL_FILE.resolve()}"
        )

    model_package = joblib.load(
        MODEL_FILE
    )

    print(
        f"Yield model loaded successfully: "
        f"{MODEL_FILE.resolve()}"
    )


# ============================================================
# Health endpoint
# ============================================================

@app.get("/health")
def health():

    return jsonify({
        "success": True,
        "message": "Yield Prediction API is running",
        "modelLoaded": model_package is not None
    })


# ============================================================
# Yield prediction
# ============================================================

@app.post("/predict")
def predict_yield():

    try:

        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "success": False,
                "message": "Request body must contain JSON data"
            }), 400

        required_fields = [
            "year",
            "state",
            "district",
            "crop",
            "area"
        ]

        missing_fields = [
            field
            for field in required_fields
            if field not in data
        ]

        if missing_fields:

            return jsonify({
                "success": False,
                "message": "Missing required fields",
                "missingFields": missing_fields
            }), 400

        year = int(data["year"])

        state = str(
            data["state"]
        ).strip()

        district = str(
            data["district"]
        ).strip()

        crop = str(
            data["crop"]
        ).strip()

        area = float(
            data["area"]
        )

        if year <= 0:

            return jsonify({
                "success": False,
                "message": "Year must be positive"
            }), 400

        if not state:

            return jsonify({
                "success": False,
                "message": "State is required"
            }), 400

        if not district:

            return jsonify({
                "success": False,
                "message": "District is required"
            }), 400

        if not crop:

            return jsonify({
                "success": False,
                "message": "Crop is required"
            }), 400

        if area <= 0:

            return jsonify({
                "success": False,
                "message": "Area must be greater than zero"
            }), 400

        # ----------------------------------------------------
        # Create model input
        # ----------------------------------------------------

        input_data = pd.DataFrame([
            {
                "Year": year,
                "State": state,
                "District": district,
                "Crop": crop,
                "Area_1000_ha": area
            }
        ])

        # ----------------------------------------------------
        # Preprocess
        # ----------------------------------------------------

        preprocessor = (
            model_package["preprocessor"]
        )

        model = (
            model_package["model"]
        )

        processed_input = (
            preprocessor.transform(
                input_data
            )
        )

        # ----------------------------------------------------
        # Prediction
        # ----------------------------------------------------

        prediction = model.predict(
            processed_input
        )[0]

        prediction = max(
            0,
            float(prediction)
        )

        # ----------------------------------------------------
        # Response
        # ----------------------------------------------------

        return jsonify({
            "success": True,
            "message": "Yield prediction generated successfully",
            "year": year,
            "state": state,
            "district": district,
            "crop": crop,
            "area": area,
            "predictedYieldKgPerHa": round(
                prediction,
                2
            )
        })

    except ValueError as exception:

        return jsonify({
            "success": False,
            "message": f"Invalid input: {exception}"
        }), 400

    except Exception as exception:

        print(
            "Prediction error:",
            exception
        )

        return jsonify({
            "success": False,
            "message": "Unable to generate yield prediction"
        }), 500


# ============================================================
# Application startup
# ============================================================

if __name__ == "__main__":

    load_model()

    print(
        "\nYield Prediction API starting..."
    )

    print(
        "URL: http://localhost:5002"
    )

    app.run(
        host="0.0.0.0",
        port=5002,
        debug=False
    )