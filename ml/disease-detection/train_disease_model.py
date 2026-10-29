import json
import random
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn

from PIL import Image
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix
)
from sklearn.model_selection import train_test_split
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from torchvision.models import (
    efficientnet_b0,
    EfficientNet_B0_Weights
)
import matplotlib.pyplot as plt
from tqdm import tqdm


# ============================================================
# CONFIGURATION
# ============================================================

SEED = 42

DATASET_DIR = Path("dataset/processed")
TRAIN_DIR = DATASET_DIR / "train"
TEST_DIR = DATASET_DIR / "test"

MODEL_PATH = Path("disease_model.pth")
CLASS_NAMES_PATH = Path("class_names.json")
METRICS_PATH = Path("model_metrics.csv")
REPORT_PATH = Path("classification_report.txt")
CONFUSION_MATRIX_PATH = Path("confusion_matrix.png")

IMAGE_SIZE = 224

BATCH_SIZE = 16

VALIDATION_SIZE = 0.10

CLASSIFIER_EPOCHS = 2
FINE_TUNE_EPOCHS = 2

LEARNING_RATE_CLASSIFIER = 0.001
LEARNING_RATE_FINE_TUNE = 0.0001

NUM_WORKERS = 0

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# ============================================================
# REPRODUCIBILITY
# ============================================================

def set_seed(seed):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)

    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


set_seed(SEED)


# ============================================================
# DATASET
# ============================================================

class LeafDataset(Dataset):

    def __init__(
        self,
        samples,
        class_to_index,
        transform=None
    ):
        self.samples = samples
        self.class_to_index = class_to_index
        self.transform = transform

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):

        image_path, class_name = self.samples[index]

        image = Image.open(image_path).convert("RGB")

        label = self.class_to_index[class_name]

        if self.transform:
            image = self.transform(image)

        return image, label


def collect_samples(directory):

    samples = []

    class_names = sorted(
        [
            directory_name.name
            for directory_name
            in directory.iterdir()
            if directory_name.is_dir()
        ]
    )

    for class_name in class_names:

        class_directory = directory / class_name

        for image_path in class_directory.iterdir():

            if image_path.suffix.lower() in [
                ".jpg",
                ".jpeg",
                ".png"
            ]:

                samples.append(
                    (image_path, class_name)
                )

    return samples, class_names


# ============================================================
# TRANSFORMS
# ============================================================

weights = EfficientNet_B0_Weights.DEFAULT

mean = weights.transforms().mean
std = weights.transforms().std


train_transform = transforms.Compose([
    transforms.Resize(
        (IMAGE_SIZE, IMAGE_SIZE)
    ),

    transforms.RandomHorizontalFlip(),

    transforms.RandomRotation(15),

    transforms.ColorJitter(
        brightness=0.15,
        contrast=0.15,
        saturation=0.15
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=mean,
        std=std
    )
])


validation_transform = transforms.Compose([
    transforms.Resize(
        (IMAGE_SIZE, IMAGE_SIZE)
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=mean,
        std=std
    )
])


def main():
    # ============================================================
    # LOAD DATA
    # ============================================================

    print("=" * 70)
    print("AGRISENSE - DISEASE DETECTION TRAINING")
    print("=" * 70)

    print(f"\nDevice: {DEVICE}")

    train_samples, class_names = collect_samples(
        TRAIN_DIR
    )

    test_samples, test_class_names = collect_samples(
        TEST_DIR
    )

    if class_names != test_class_names:

        raise RuntimeError(
            "Train and test class names do not match."
        )


    num_classes = len(class_names)

    print(f"Classes: {num_classes}")

    print(
        f"Training images: {len(train_samples)}"
    )

    print(
        f"Test images: {len(test_samples)}"
    )


    # ============================================================
    # CLASS MAPPING
    # ============================================================

    class_to_index = {
        class_name: index
        for index, class_name
        in enumerate(class_names)
    }

    index_to_class = {
        index: class_name
        for class_name, index
        in class_to_index.items()
    }


    with open(
        CLASS_NAMES_PATH,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            class_names,
            file,
            indent=4
        )


    # ============================================================
    # STRATIFIED VALIDATION SPLIT
    # ============================================================

    train_labels = [
        class_to_index[class_name]
        for _, class_name
        in train_samples
    ]


    train_indices, validation_indices = train_test_split(
        np.arange(len(train_samples)),
        test_size=VALIDATION_SIZE,
        random_state=SEED,
        stratify=train_labels
    )


    actual_train_samples = [
        train_samples[index]
        for index in train_indices
    ]

    validation_samples = [
        train_samples[index]
        for index in validation_indices
    ]


    print(
        f"\nTraining subset: "
        f"{len(actual_train_samples)}"
    )

    print(
        f"Validation subset: "
        f"{len(validation_samples)}"
    )

    print(
        f"Official test set: "
        f"{len(test_samples)}"
    )


    # ============================================================
    # DATASETS
    # ============================================================

    train_dataset = LeafDataset(
        actual_train_samples,
        class_to_index,
        train_transform
    )

    validation_dataset = LeafDataset(
        validation_samples,
        class_to_index,
        validation_transform
    )

    test_dataset = LeafDataset(
        test_samples,
        class_to_index,
        validation_transform
    )


    # ============================================================
    # DATA LOADERS
    # ============================================================

    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        num_workers=NUM_WORKERS
    )

    validation_loader = DataLoader(
        validation_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=NUM_WORKERS
    )

    test_loader = DataLoader(
        test_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=NUM_WORKERS
    )


    # ============================================================
    # CLASS WEIGHTS
    # ============================================================

    class_counts = np.zeros(
        num_classes,
        dtype=np.int64
    )

    for _, class_name in actual_train_samples:

        class_index = class_to_index[class_name]

        class_counts[class_index] += 1


    class_weights = (
        len(actual_train_samples)
        /
        (
            num_classes
            * class_counts
        )
    )


    class_weights = torch.tensor(
        class_weights,
        dtype=torch.float32
    ).to(DEVICE)


    print("\nClass weighting enabled.")


    # ============================================================
    # MODEL
    # ============================================================

    print("\nLoading pretrained EfficientNet-B0...")

    model = efficientnet_b0(
        weights=weights
    )

    in_features = (
        model.classifier[1].in_features
    )

    model.classifier[1] = nn.Linear(
        in_features,
        num_classes
    )

    model = model.to(DEVICE)


    # ============================================================
    # TRAINING FUNCTIONS
    # ============================================================

    criterion = nn.CrossEntropyLoss(
        weight=class_weights
    )


    def train_one_epoch(
        model,
        loader,
        optimizer
    ):

        model.train()

        running_loss = 0.0

        predictions = []
        targets = []

        progress = tqdm(
            loader,
            desc="Training",
            leave=False
        )

        for images, labels in progress:

            images = images.to(DEVICE)
            labels = labels.to(DEVICE)

            optimizer.zero_grad()

            outputs = model(images)

            loss = criterion(
                outputs,
                labels
            )

            loss.backward()

            optimizer.step()

            running_loss += (
                loss.item()
                * images.size(0)
            )

            predicted = (
                outputs.argmax(dim=1)
            )

            predictions.extend(
                predicted.detach()
                .cpu()
                .numpy()
            )

            targets.extend(
                labels.detach()
                .cpu()
                .numpy()
            )

        epoch_loss = (
            running_loss
            /
            len(loader.dataset)
        )

        accuracy = accuracy_score(
            targets,
            predictions
        )

        return epoch_loss, accuracy


    def evaluate(
        model,
        loader
    ):

        model.eval()

        running_loss = 0.0

        predictions = []
        targets = []

        with torch.no_grad():

            for images, labels in tqdm(
                loader,
                desc="Evaluating",
                leave=False
            ):

                images = images.to(DEVICE)
                labels = labels.to(DEVICE)

                outputs = model(images)

                loss = criterion(
                    outputs,
                    labels
                )

                running_loss += (
                    loss.item()
                    * images.size(0)
                )

                predicted = (
                    outputs.argmax(dim=1)
                )

                predictions.extend(
                    predicted.cpu().numpy()
                )

                targets.extend(
                    labels.cpu().numpy()
                )

        loss = (
            running_loss
            /
            len(loader.dataset)
        )

        accuracy = accuracy_score(
            targets,
            predictions
        )

        precision, recall, f1, _ = (
            precision_recall_fscore_support(
                targets,
                predictions,
                average="macro",
                zero_division=0
            )
        )

        return (
            loss,
            accuracy,
            precision,
            recall,
            f1,
            targets,
            predictions
        )


    # ============================================================
    # PHASE 1
    # TRAIN CLASSIFIER
    # ============================================================

    print("\n" + "=" * 70)
    print("PHASE 1 - CLASSIFIER TRAINING")
    print("=" * 70)

    for parameter in model.features.parameters():

        parameter.requires_grad = False


    optimizer = torch.optim.AdamW(
        model.classifier.parameters(),
        lr=LEARNING_RATE_CLASSIFIER
    )


    best_validation_f1 = -1.0

    training_history = []


    for epoch in range(
        CLASSIFIER_EPOCHS
    ):

        print(
            f"\nEpoch "
            f"{epoch + 1}/"
            f"{CLASSIFIER_EPOCHS}"
        )

        train_loss, train_accuracy = (
            train_one_epoch(
                model,
                train_loader,
                optimizer
            )
        )

        (
            validation_loss,
            validation_accuracy,
            validation_precision,
            validation_recall,
            validation_f1,
            _,
            _
        ) = evaluate(
            model,
            validation_loader
        )

        print(
            f"Train Loss: {train_loss:.4f}"
        )

        print(
            f"Train Accuracy: "
            f"{train_accuracy:.4f}"
        )

        print(
            f"Validation Accuracy: "
            f"{validation_accuracy:.4f}"
        )

        print(
            f"Validation Macro F1: "
            f"{validation_f1:.4f}"
        )

        training_history.append({
            "phase": "classifier",
            "epoch": epoch + 1,
            "train_loss": train_loss,
            "train_accuracy": train_accuracy,
            "validation_loss": validation_loss,
            "validation_accuracy": validation_accuracy,
            "validation_precision": validation_precision,
            "validation_recall": validation_recall,
            "validation_f1": validation_f1
        })

        if validation_f1 > best_validation_f1:

            best_validation_f1 = validation_f1

            torch.save(
                model.state_dict(),
                MODEL_PATH
            )


    # ============================================================
    # PHASE 2
    # FINE-TUNE FINAL EFFICIENTNET LAYERS
    # ============================================================

    print("\n" + "=" * 70)
    print("PHASE 2 - FINE TUNING")
    print("=" * 70)


    for parameter in model.features.parameters():

        parameter.requires_grad = False


    # Unfreeze the final EfficientNet block
    for parameter in model.features[-2:].parameters():

        parameter.requires_grad = True


    optimizer = torch.optim.AdamW(
        filter(
            lambda parameter:
            parameter.requires_grad,
            model.parameters()
        ),
        lr=LEARNING_RATE_FINE_TUNE
    )


    for epoch in range(
        FINE_TUNE_EPOCHS
    ):

        print(
            f"\nFine-tuning Epoch "
            f"{epoch + 1}/"
            f"{FINE_TUNE_EPOCHS}"
        )

        train_loss, train_accuracy = (
            train_one_epoch(
                model,
                train_loader,
                optimizer
            )
        )

        (
            validation_loss,
            validation_accuracy,
            validation_precision,
            validation_recall,
            validation_f1,
            _,
            _
        ) = evaluate(
            model,
            validation_loader
        )

        print(
            f"Train Loss: {train_loss:.4f}"
        )

        print(
            f"Train Accuracy: "
            f"{train_accuracy:.4f}"
        )

        print(
            f"Validation Accuracy: "
            f"{validation_accuracy:.4f}"
        )

        print(
            f"Validation Macro F1: "
            f"{validation_f1:.4f}"
        )

        training_history.append({
            "phase": "fine_tuning",
            "epoch": epoch + 1,
            "train_loss": train_loss,
            "train_accuracy": train_accuracy,
            "validation_loss": validation_loss,
            "validation_accuracy": validation_accuracy,
            "validation_precision": validation_precision,
            "validation_recall": validation_recall,
            "validation_f1": validation_f1
        })

        if validation_f1 > best_validation_f1:

            best_validation_f1 = validation_f1

            torch.save(
                model.state_dict(),
                MODEL_PATH
            )


    # ============================================================
    # LOAD BEST MODEL
    # ============================================================

    print("\nLoading best validation model...")

    model.load_state_dict(
        torch.load(
            MODEL_PATH,
            map_location=DEVICE
        )
    )


    # ============================================================
    # FINAL TEST EVALUATION
    # ============================================================

    print("\n" + "=" * 70)
    print("FINAL TEST EVALUATION")
    print("=" * 70)

    (
        test_loss,
        test_accuracy,
        test_precision,
        test_recall,
        test_f1,
        test_targets,
        test_predictions
    ) = evaluate(
        model,
        test_loader
    )


    print(
        f"\nTest Loss: "
        f"{test_loss:.4f}"
    )

    print(
        f"Test Accuracy: "
        f"{test_accuracy:.4f}"
    )

    print(
        f"Test Macro Precision: "
        f"{test_precision:.4f}"
    )

    print(
        f"Test Macro Recall: "
        f"{test_recall:.4f}"
    )

    print(
        f"Test Macro F1: "
        f"{test_f1:.4f}"
    )


    # ============================================================
    # CLASSIFICATION REPORT
    # ============================================================

    report = classification_report(
        test_targets,
        test_predictions,
        target_names=class_names,
        digits=4,
        zero_division=0
    )

    with open(
        REPORT_PATH,
        "w",
        encoding="utf-8"
    ) as file:

        file.write(report)


    # ============================================================
    # CONFUSION MATRIX
    # ============================================================

    matrix = confusion_matrix(
        test_targets,
        test_predictions
    )

    plt.figure(
        figsize=(18, 16)
    )

    plt.imshow(
        matrix,
        interpolation="nearest"
    )

    plt.title(
        "PlantVillage Disease Detection - Confusion Matrix"
    )

    plt.xlabel("Predicted Class")

    plt.ylabel("True Class")

    plt.colorbar()

    plt.xticks(
        range(num_classes),
        class_names,
        rotation=90,
        fontsize=6
    )

    plt.yticks(
        range(num_classes),
        class_names,
        fontsize=6
    )

    plt.tight_layout()

    plt.savefig(
        CONFUSION_MATRIX_PATH,
        dpi=200
    )

    plt.close()


    # ============================================================
    # SAVE METRICS
    # ============================================================

    final_metrics = {
        "test_loss": test_loss,
        "test_accuracy": test_accuracy,
        "test_macro_precision": test_precision,
        "test_macro_recall": test_recall,
        "test_macro_f1": test_f1,
        "best_validation_macro_f1": best_validation_f1,
        "training_images": len(actual_train_samples),
        "validation_images": len(validation_samples),
        "test_images": len(test_samples),
        "number_of_classes": num_classes
    }


    metrics_dataframe = pd.DataFrame(
        [final_metrics]
    )

    metrics_dataframe.to_csv(
        METRICS_PATH,
        index=False
    )


    # ============================================================
    # FINISHED
    # ============================================================

    print("\n" + "=" * 70)
    print("TRAINING COMPLETED")
    print("=" * 70)

    print(
        f"\nModel saved to: "
        f"{MODEL_PATH}"
    )

    print(
        f"Class names saved to: "
        f"{CLASS_NAMES_PATH}"
    )

    print(
        f"Metrics saved to: "
        f"{METRICS_PATH}"
    )

    print(
        f"Classification report saved to: "
        f"{REPORT_PATH}"
    )

    print(
        f"Confusion matrix saved to: "
        f"{CONFUSION_MATRIX_PATH}"
    )


if __name__ == "__main__":
    main()
