import pandas as pd
import numpy as np
import joblib

from pathlib import Path

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# ============================================================
# FILES
# ============================================================

TRAIN_FILE = Path("yield_train.csv")
VALIDATION_FILE = Path("yield_validation.csv")
TEST_FILE = Path("yield_test.csv")

MODEL_FILE = Path("yield_model.pkl")
METRICS_FILE = Path("yield_model_metrics.txt")


# ============================================================
# FEATURES
# ============================================================

FEATURES = [
    "Year",
    "State",
    "District",
    "Crop",
    "Area_1000_ha"
]

TARGET = "Yield_kg_per_ha"


def evaluate_model(model, X, y, dataset_name):

    predictions = model.predict(X)

    mae = mean_absolute_error(
        y,
        predictions
    )

    rmse = np.sqrt(
        mean_squared_error(
            y,
            predictions
        )
    )

    r2 = r2_score(
        y,
        predictions
    )

    print(f"\n{dataset_name} RESULTS")
    print("-" * 60)
    print(f"MAE  : {mae:.2f} kg/ha")
    print(f"RMSE : {rmse:.2f} kg/ha")
    print(f"R²   : {r2:.4f}")

    return mae, rmse, r2


def main():

    print("=" * 70)
    print("AGRISENSE - YIELD PREDICTION MODEL TRAINING")
    print("=" * 70)

    # ========================================================
    # 1. Load datasets
    # ========================================================

    print("\nLoading datasets...")

    train_df = pd.read_csv(TRAIN_FILE)
    validation_df = pd.read_csv(VALIDATION_FILE)
    test_df = pd.read_csv(TEST_FILE)

    print(
        f"Training records   : {len(train_df):,}"
    )

    print(
        f"Validation records : {len(validation_df):,}"
    )

    print(
        f"Test records       : {len(test_df):,}"
    )

    # ========================================================
    # 2. Separate features and target
    # ========================================================

    X_train = train_df[FEATURES]
    y_train = train_df[TARGET]

    X_validation = validation_df[FEATURES]
    y_validation = validation_df[TARGET]

    X_test = test_df[FEATURES]
    y_test = test_df[TARGET]

    # ========================================================
    # 3. Feature types
    # ========================================================

    categorical_features = [
        "State",
        "District",
        "Crop"
    ]

    numerical_features = [
        "Year",
        "Area_1000_ha"
    ]

    # ========================================================
    # 4. Preprocessing
    # ========================================================

    print("\nPreparing categorical features...")

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(
                    handle_unknown="ignore"
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

    # ========================================================
    # 5. Random Forest
    # ========================================================

    print("\nCreating Random Forest model...")

    model = RandomForestRegressor(
        n_estimators=150,
        max_depth=25,
        min_samples_leaf=2,
        max_features="sqrt",
        random_state=42,
        n_jobs=-1
    )

    # ========================================================
    # 6. Transform training data
    # ========================================================

    print("\nFitting preprocessing pipeline...")

    X_train_processed = preprocessor.fit_transform(
        X_train
    )

    X_validation_processed = (
        preprocessor.transform(X_validation)
    )

    X_test_processed = (
        preprocessor.transform(X_test)
    )

    print(
        f"Processed training shape: "
        f"{X_train_processed.shape}"
    )

    # ========================================================
    # 7. Train model
    # ========================================================

    print("\nTraining Random Forest...")
    print("This may take a few minutes.\n")

    model.fit(
        X_train_processed,
        y_train
    )

    print("Training completed.")

    # ========================================================
    # 8. Validation
    # ========================================================

    validation_metrics = evaluate_model(
        model,
        X_validation_processed,
        y_validation,
        "VALIDATION"
    )

    # ========================================================
    # 9. Final test
    # ========================================================

    test_metrics = evaluate_model(
        model,
        X_test_processed,
        y_test,
        "FINAL TEST"
    )

    # ========================================================
    # 10. Save model + preprocessor
    # ========================================================

    model_package = {
        "model": model,
        "preprocessor": preprocessor,
        "features": FEATURES,
        "target": TARGET
    }

    joblib.dump(
        model_package,
        MODEL_FILE
    )

    # ========================================================
    # 11. Save metrics
    # ========================================================

    validation_mae, validation_rmse, validation_r2 = (
        validation_metrics
    )

    test_mae, test_rmse, test_r2 = (
        test_metrics
    )

    metrics_text = f"""
AGRISENSE YIELD PREDICTION MODEL
================================

Model:
Random Forest Regressor

Training records:
{len(train_df):,}

Validation records:
{len(validation_df):,}

Test records:
{len(test_df):,}

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

Production was NOT used as an input feature
because yield is derived from production and area.
"""

    METRICS_FILE.write_text(
        metrics_text.strip(),
        encoding="utf-8"
    )

    # ========================================================
    # 12. Final output
    # ========================================================

    print("\n" + "=" * 70)
    print("MODEL TRAINING COMPLETED")
    print("=" * 70)

    print(
        f"\nModel saved to:"
        f"\n{MODEL_FILE.resolve()}"
    )

    print(
        f"\nMetrics saved to:"
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