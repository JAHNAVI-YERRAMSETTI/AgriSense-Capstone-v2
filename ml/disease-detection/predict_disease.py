import json
from pathlib import Path

import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights


# ============================================================
# CONFIGURATION
# ============================================================

MODEL_PATH = Path("disease_model.pth")
CLASS_NAMES_PATH = Path("class_names.json")

IMAGE_PATH = Path(
    r"D:\Documents\CAPSTONE_PROJECT-01\ml\disease-detection\dataset\processed\test\Apple___Apple_scab\0a5e9323-dbad-432d-ac58-d291718345d9___FREC_Scab 3417.JPG"
)

IMAGE_SIZE = 224

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# ============================================================
# LOAD CLASS NAMES
# ============================================================

with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as file:
    class_names = json.load(file)

num_classes = len(class_names)

print(f"Number of classes: {num_classes}")
print(f"Device: {DEVICE}")


# ============================================================
# LOAD MODEL
# ============================================================

weights = EfficientNet_B0_Weights.DEFAULT

model = efficientnet_b0(weights=None)

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

print("Model loaded successfully.")


# ============================================================
# IMAGE PREPROCESSING
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
# LOAD IMAGE
# ============================================================

image = Image.open(
    IMAGE_PATH
).convert("RGB")

input_tensor = transform(image)

input_tensor = input_tensor.unsqueeze(0)

input_tensor = input_tensor.to(DEVICE)


# ============================================================
# PREDICTION
# ============================================================

with torch.no_grad():

    outputs = model(input_tensor)

    probabilities = torch.softmax(
        outputs,
        dim=1
    )

    top_probabilities, top_indices = torch.topk(
        probabilities,
        k=3,
        dim=1
    )


# ============================================================
# DISPLAY RESULTS
# ============================================================

print("\n" + "=" * 60)
print("DISEASE PREDICTION RESULT")
print("=" * 60)

print("\nActual class:")
print("Apple___Apple_scab")

print("\nTop 3 predictions:")

for rank in range(3):

    index = top_indices[0][rank].item()

    probability = (
        top_probabilities[0][rank].item()
        * 100
    )

    print(
        f"{rank + 1}. "
        f"{class_names[index]} "
        f"({probability:.2f}%)"
    )

predicted_index = top_indices[0][0].item()

predicted_class = class_names[
    predicted_index
]

predicted_confidence = (
    top_probabilities[0][0].item()
    * 100
)

print("\n" + "-" * 60)

print(
    f"Predicted class: {predicted_class}"
)

print(
    f"Confidence: {predicted_confidence:.2f}%"
)

if predicted_class == "Apple___Apple_scab":

    print("Result: CORRECT")

else:

    print("Result: INCORRECT")

print("=" * 60)