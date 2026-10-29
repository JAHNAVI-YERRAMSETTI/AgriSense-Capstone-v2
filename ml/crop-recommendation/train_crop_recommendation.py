import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC


# --------------------------------------------------
# 1. Load dataset
# --------------------------------------------------

df = pd.read_csv("Crop_recommendation.csv")

X = df.drop(columns=["label"])
y = df["label"]


# --------------------------------------------------
# 2. Train-test split
# --------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# --------------------------------------------------
# 3. Define models
# --------------------------------------------------

models = {

    "Logistic Regression": Pipeline([
        ("scaler", StandardScaler()),
        (
            "model",
            LogisticRegression(
                max_iter=3000,
                random_state=42
            )
        )
    ]),

    "Decision Tree": DecisionTreeClassifier(
        random_state=42
    ),

    "Random Forest": RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        n_jobs=-1
    ),

    "KNN": Pipeline([
        ("scaler", StandardScaler()),
        (
            "model",
            KNeighborsClassifier(n_neighbors=5)
        )
    ]),

    "SVM": Pipeline([
        ("scaler", StandardScaler()),
        (
            "model",
            SVC(
                kernel="rbf",
                random_state=42
            )
        )
    ])
}


# --------------------------------------------------
# 4. Train and evaluate models
# --------------------------------------------------

results = []

best_model = None
best_model_name = None
best_f1 = -1
best_accuracy = -1


for name, model in models.items():

    print("\nTraining:", name)

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    precision = precision_score(
        y_test,
        predictions,
        average="macro",
        zero_division=0
    )

    recall = recall_score(
        y_test,
        predictions,
        average="macro",
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        predictions,
        average="macro",
        zero_division=0
    )

    print("Accuracy :", accuracy)
    print("Precision:", precision)
    print("Recall   :", recall)
    print("F1 Score :", f1)

    results.append({
        "model": name,
        "accuracy": accuracy,
        "precision_macro": precision,
        "recall_macro": recall,
        "f1_macro": f1
    })

    # Select model using macro F1 first,
    # then accuracy as the tie-breaker.
    if (
        f1 > best_f1
        or (
            f1 == best_f1
            and accuracy > best_accuracy
        )
    ):
        best_f1 = f1
        best_accuracy = accuracy
        best_model = model
        best_model_name = name


# --------------------------------------------------
# 5. Save model comparison
# --------------------------------------------------

results_df = pd.DataFrame(results)

results_df = results_df.sort_values(
    by=["f1_macro", "accuracy"],
    ascending=False
)

results_df.to_csv(
    "model_metrics.csv",
    index=False
)


# --------------------------------------------------
# 6. Save best model
# --------------------------------------------------

joblib.dump(
    best_model,
    "crop_recommendation_model.joblib"
)


# --------------------------------------------------
# 7. Print final result
# --------------------------------------------------

print("\n" + "=" * 50)

print("MODEL COMPARISON")
print("=" * 50)

print(
    results_df.to_string(
        index=False,
        float_format=lambda x: f"{x:.4f}"
    )
)

print("\nSelected Model:", best_model_name)

print("Best Accuracy :", f"{best_accuracy:.4f}")

print("Best F1 Score :", f"{best_f1:.4f}")

print("\nModel saved as:")
print("crop_recommendation_model.joblib")

print("=" * 50)