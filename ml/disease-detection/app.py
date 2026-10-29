import json
from pathlib import Path

import torch
import torch.nn as nn
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image
from torchvision import transforms
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "disease_model.pth"
CLASS_NAMES_PATH = BASE_DIR / "class_names.json"

IMAGE_SIZE = 224

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# ============================================================
# FLASK APPLICATION
# ============================================================

app = Flask(__name__)

CORS(app)


# ============================================================
# LOAD CLASS NAMES
# ============================================================

with open(
    CLASS_NAMES_PATH,
    "r",
    encoding="utf-8"
) as file:

    class_names = json.load(file)


num_classes = len(class_names)


# ============================================================
# LOAD MODEL
# ============================================================

weights = EfficientNet_B0_Weights.DEFAULT

model = efficientnet_b0(
    weights=None
)

in_features = model.classifier[1].in_features

model.classifier[1] = nn.Linear(
    in_features,
    num_classes
)

checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE
)

model.load_state_dict(checkpoint)

model = model.to(DEVICE)

model.eval()


# ============================================================
# IMAGE TRANSFORMATION
# ============================================================

mean = weights.transforms().mean
std = weights.transforms().std

transform = transforms.Compose([
    transforms.Resize(
        (IMAGE_SIZE, IMAGE_SIZE)
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=mean,
        std=std
    )
])


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route(
    "/health",
    methods=["GET"]
)
def health():

    return jsonify({
        "success": True,
        "message": "Disease Detection API is running",
        "modelLoaded": True,
        "numberOfClasses": num_classes
    })


# ============================================================
# DISEASE PREDICTION
# ============================================================

@app.route(
    "/predict",
    methods=["POST"]
)
def predict():

    if "image" not in request.files:

        return jsonify({
            "success": False,
            "message": "No image file provided"
        }), 400


    image_file = request.files["image"]


    if image_file.filename == "":

        return jsonify({
            "success": False,
            "message": "No image selected"
        }), 400


    try:

        image = Image.open(
            image_file.stream
        ).convert("RGB")


        input_tensor = transform(
            image
        )

        input_tensor = input_tensor.unsqueeze(
            0
        )

        input_tensor = input_tensor.to(
            DEVICE
        )


        # ----------------------------------------------------
        # MODEL PREDICTION
        # ----------------------------------------------------

        with torch.no_grad():

            outputs = model(
                input_tensor
            )

            probabilities = torch.softmax(
                outputs,
                dim=1
            )

            top_probabilities, top_indices = torch.topk(
                probabilities,
                k=3,
                dim=1
            )


        # ----------------------------------------------------
        # TOP PREDICTIONS
        # ----------------------------------------------------

        top_predictions = []


        for rank in range(3):

            index = top_indices[
                0
            ][rank].item()

            probability = (
                top_probabilities[
                    0
                ][rank].item()
                * 100
            )


            top_predictions.append({
                "disease": class_names[index],
                "confidence": round(
                    probability,
                    2
                )
            })


        predicted_index = top_indices[
            0
        ][0].item()


        predicted_disease = class_names[
            predicted_index
        ]


        predicted_confidence = (
            top_probabilities[
                0
            ][0].item()
            * 100
        )


        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return jsonify({

            "success": True,

            "message": "Disease prediction generated successfully",

            "predictedDisease":
                predicted_disease,

            "confidence":
                round(
                    predicted_confidence,
                    2
                ),

            "topPredictions":
                top_predictions
        })


    except Exception as error:

        print(
            "Prediction error:",
            error
        )

        return jsonify({

            "success": False,

            "message":
                "Failed to process the image",

            "error":
                str(error)
        }), 500


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    print(
        "\nStarting AgriSense Disease Detection API..."
    )

    print(
        f"Device: {DEVICE}"
    )

    print(
        f"Classes loaded: {num_classes}"
    )

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=False
    )