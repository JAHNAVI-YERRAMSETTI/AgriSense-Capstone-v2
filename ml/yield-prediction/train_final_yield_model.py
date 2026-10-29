import pandas as pd
import numpy as np
import joblib

from pathlib import Path

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


TRAIN_FILE = Path("yield_train.csv")
VALIDATION_FILE = Path("yield_validation.csv")
TEST_FILE = Path("yield_test.csv")

MODEL_FILE = Path("yield_model_hgb.pkl")
METRICS_FILE = Path("yield_model_hgb_metrics.txt")


FEATURES = [
    "Year",
    "State",
    "District",
    "Crop",
    "Area_1000_ha"
]

TARGET = "Yield_kg_per_ha"


def evaluate_model(model, X, y, name):

    predictions = model.predict(X)

    mae = mean_absolute_error(y, predictions)

    rmse = np.sqrt(
        mean_squared_error(y, predictions)
    )

    r2 = r2_score(y, predictions)

    print(f"\n{name}")
    print("-" * 60)
    print(f"MAE  : {mae:.2f} kg/ha")
    print(f"RMSE : {rmse:.2f} kg/ha")
    print(f"R²   : {r2:.4f}")

    return mae, rmse, r2


def main():

    print("=" * 70)
    print("AGRISENSE - FINAL YIELD PREDICTION MODEL")
    print("=" * 70)

    # ---------------------------------------------------------
    # Load data
    # ---------------------------------------------------------

    print("\nLoading datasets...")

    train = pd.read_csv(TRAIN_FILE)
    validation = pd.read_csv(VALIDATION_FILE)
    test = pd.read_csv(TEST_FILE)

    print(
        f"Training records   : {len(train):,}"
    )

    print(
        f"Validation records : {len(validation):,}"
    )

    print(
        f"Test records       : {len(test):,}"
    )

    # ---------------------------------------------------------
    # Features and target
    # ---------------------------------------------------------

    X_train = train[FEATURES]
    y_train = train[TARGET]

    X_validation = validation[FEATURES]
    y_validation = validation[TARGET]

    X_test = test[FEATURES]
    y_test = test[TARGET]

    categorical_features = [
        "State",
        "District",
        "Crop"
    ]

    numerical_features = [
        "Year",
        "Area_1000_ha"
    ]

    # ---------------------------------------------------------
    # Preprocessing
    # ---------------------------------------------------------

    print("\nPreparing preprocessing pipeline...")

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(
                    handle_unknown="ignore",
                    sparse_output=False
                ),
                categorical_features
            ),
            (
                "numerical",
                "passthrough",
                numerical_features
            )
        ]
    )

    X_train_processed = preprocessor.fit_transform(
        X_train
    )

    X_validation_processed = preprocessor.transform(
        X_validation
    )

    X_test_processed = preprocessor.transform(
        X_test
    )

    print(
        f"Processed feature shape: "
        f"{X_train_processed.shape}"
    )

    # ---------------------------------------------------------
    # Final HistGradientBoosting model
    # ---------------------------------------------------------

    print("\nCreating final model...")

    model = HistGradientBoostingRegressor(
        max_iter=300,
        learning_rate=0.08,
        max_leaf_nodes=31,
        min_samples_leaf=20,
        l2_regularization=1.0,
        random_state=42
    )

    # ---------------------------------------------------------
    # Train
    # ---------------------------------------------------------

    print("\nTraining final model...")
    print("Please wait...\n")

    model.fit(
        X_train_processed,
        y_train
    )

    print("Training completed.")

    # ---------------------------------------------------------
    # Validation
    # ---------------------------------------------------------

    validation_metrics = evaluate_model(
        model,
        X_validation_processed,
        y_validation,
        "VALIDATION RESULTS"
    )

    # ---------------------------------------------------------
    # Final test
    # ---------------------------------------------------------

    test_metrics = evaluate_model(
        model,
        X_test_processed,
        y_test,
        "FINAL TEST RESULTS"
    )

    # ---------------------------------------------------------
    # Package everything needed for prediction
    # ---------------------------------------------------------

    model_package = {
        "model": model,
        "preprocessor": preprocessor,
        "features": FEATURES,
        "target": TARGET,
        "model_name": "HistGradientBoostingRegressor"
    }

    joblib.dump(
        model_package,
        MODEL_FILE
    )

    # ---------------------------------------------------------
    # Save metrics
    # ---------------------------------------------------------

    validation_mae, validation_rmse, validation_r2 = (
        validation_metrics
    )

    test_mae, test_rmse, test_r2 = (
        test_metrics
    )

    metrics_text = f"""
AGRISENSE YIELD PREDICTION
==========================

Final Model:
HistGradientBoostingRegressor

Training Records:
{len(train):,}

Validation Records:
{len(validation):,}

Test Records:
{len(test):,}

Training Period:
1966-2012

Validation Period:
2013-2014

Test Period:
2015-2017

Features:
{", ".join(FEATURES)}

Target:
{TARGET}

Validation Results
------------------
MAE  : {validation_mae:.4f} kg/ha
RMSE : {validation_rmse:.4f} kg/ha
R2   : {validation_r2:.4f}

Final Test Results
------------------
MAE  : {test_mae:.4f} kg/ha
RMSE : {test_rmse:.4f} kg/ha
R2   : {test_r2:.4f}

Random Forest Baseline
----------------------
MAE  : 579.90 kg/ha
RMSE : 942.15 kg/ha
R2   : 0.6958

HistGradientBoosting Comparison
--------------------------------
MAE  : 443.15 kg/ha
RMSE : 733.20 kg/ha
R2   : 0.8157

Production was intentionally excluded as an input
feature because yield is derived from production and area.
"""

    METRICS_FILE.write_text(
        metrics_text.strip(),
        encoding="utf-8"
    )

    # ---------------------------------------------------------
    # Final summary
    # ---------------------------------------------------------

    print("\n" + "=" * 70)
    print("FINAL MODEL SAVED SUCCESSFULLY")
    print("=" * 70)

    print(
        f"\nModel:"
        f"\n{MODEL_FILE.resolve()}"
    )

    print(
        f"\nMetrics:"
        f"\n{METRICS_FILE.resolve()}"
    )

    print("\nFINAL TEST PERFORMANCE")
    print("-" * 60)
    print(
        f"MAE  : {test_mae:.2f} kg/ha"
    )
    print(
        f"RMSE : {test_rmse:.2f} kg/ha"
    )
    print(
        f"R²   : {test_r2:.4f}"
    )


if __name__ == "__main__":
    main()