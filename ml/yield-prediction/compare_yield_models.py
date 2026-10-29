import pandas as pd
import numpy as np

from pathlib import Path

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


TRAIN_FILE = Path("yield_train.csv")
VALIDATION_FILE = Path("yield_validation.csv")
TEST_FILE = Path("yield_test.csv")

FEATURES = [
    "Year",
    "State",
    "District",
    "Crop",
    "Area_1000_ha"
]

TARGET = "Yield_kg_per_ha"


def evaluate(model, X, y, name):

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
    print("AGRISENSE - YIELD MODEL COMPARISON")
    print("=" * 70)

    print("\nLoading datasets...")

    train = pd.read_csv(TRAIN_FILE)
    validation = pd.read_csv(VALIDATION_FILE)
    test = pd.read_csv(TEST_FILE)

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
    # One-hot encoding
    # ---------------------------------------------------------

    print("\nPreparing features...")

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
    # HistGradientBoosting
    # ---------------------------------------------------------

    print("\nCreating HistGradientBoosting model...")

    model = HistGradientBoostingRegressor(
        max_iter=300,
        learning_rate=0.08,
        max_leaf_nodes=31,
        min_samples_leaf=20,
        l2_regularization=1.0,
        random_state=42
    )

    print("\nTraining model...")
    print("This may take a few minutes.\n")

    model.fit(
        X_train_processed,
        y_train
    )

    print("Training completed.")

    # ---------------------------------------------------------
    # Validation
    # ---------------------------------------------------------

    validation_results = evaluate(
        model,
        X_validation_processed,
        y_validation,
        "VALIDATION RESULTS"
    )

    # ---------------------------------------------------------
    # Test
    # ---------------------------------------------------------

    test_results = evaluate(
        model,
        X_test_processed,
        y_test,
        "FINAL TEST RESULTS"
    )

    # ---------------------------------------------------------
    # Comparison
    # ---------------------------------------------------------

    baseline_mae = 579.90
    baseline_rmse = 942.15
    baseline_r2 = 0.6958

    new_mae, new_rmse, new_r2 = test_results

    print("\n" + "=" * 70)
    print("MODEL COMPARISON")
    print("=" * 70)

    print(
        f"\n{'Metric':<10}"
        f"{'Random Forest':>20}"
        f"{'HistGradientBoosting':>25}"
    )

    print("-" * 55)

    print(
        f"{'MAE':<10}"
        f"{baseline_mae:>20.2f}"
        f"{new_mae:>25.2f}"
    )

    print(
        f"{'RMSE':<10}"
        f"{baseline_rmse:>20.2f}"
        f"{new_rmse:>25.2f}"
    )

    print(
        f"{'R²':<10}"
        f"{baseline_r2:>20.4f}"
        f"{new_r2:>25.4f}"
    )

    print("\nBaseline:")
    print("Random Forest")

    print("\nComparison model:")
    print("HistGradientBoostingRegressor")

    print(
        "\nThe final model will be selected "
        "after examining the actual test results."
    )


if __name__ == "__main__":
    main()