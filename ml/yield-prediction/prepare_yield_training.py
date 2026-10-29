import pandas as pd
from pathlib import Path


INPUT_FILE = Path("yield_training_data.csv")

TRAIN_FILE = Path("yield_train.csv")
VALIDATION_FILE = Path("yield_validation.csv")
TEST_FILE = Path("yield_test.csv")


def main():

    if not INPUT_FILE.exists():
        raise FileNotFoundError(
            f"File not found: {INPUT_FILE.resolve()}"
        )

    df = pd.read_csv(INPUT_FILE)

    print("=" * 70)
    print("AGRISENSE - YIELD TRAINING DATA PREPARATION")
    print("=" * 70)

    # ---------------------------------------------------------
    # Basic validation
    # ---------------------------------------------------------

    required_columns = [
        "Year",
        "State",
        "District",
        "Crop",
        "Area_1000_ha",
        "Yield_kg_per_ha"
    ]

    missing = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing:
        raise ValueError(
            f"Missing required columns: {missing}"
        )

    df["Year"] = pd.to_numeric(
        df["Year"],
        errors="coerce"
    )

    df["Area_1000_ha"] = pd.to_numeric(
        df["Area_1000_ha"],
        errors="coerce"
    )

    df["Yield_kg_per_ha"] = pd.to_numeric(
        df["Yield_kg_per_ha"],
        errors="coerce"
    )

    df = df.dropna(
        subset=[
            "Year",
            "State",
            "District",
            "Crop",
            "Area_1000_ha",
            "Yield_kg_per_ha"
        ]
    ).copy()

    # ---------------------------------------------------------
    # Time-based split
    #
    # Train:      1966 - 2012
    # Validation: 2013 - 2014
    # Test:       2015 - 2017
    # ---------------------------------------------------------

    train_df = df[
        (df["Year"] >= 1966) &
        (df["Year"] <= 2012)
    ].copy()

    validation_df = df[
        (df["Year"] >= 2013) &
        (df["Year"] <= 2014)
    ].copy()

    test_df = df[
        (df["Year"] >= 2015) &
        (df["Year"] <= 2017)
    ].copy()

    # ---------------------------------------------------------
    # Sort records
    # ---------------------------------------------------------

    sort_columns = [
        "Year",
        "State",
        "District",
        "Crop"
    ]

    train_df = train_df.sort_values(sort_columns)
    validation_df = validation_df.sort_values(sort_columns)
    test_df = test_df.sort_values(sort_columns)

    # ---------------------------------------------------------
    # Save
    # ---------------------------------------------------------

    train_df.to_csv(
        TRAIN_FILE,
        index=False
    )

    validation_df.to_csv(
        VALIDATION_FILE,
        index=False
    )

    test_df.to_csv(
        TEST_FILE,
        index=False
    )

    # ---------------------------------------------------------
    # Display summary
    # ---------------------------------------------------------

    print("\nTIME-BASED SPLIT")
    print("-" * 70)

    print(
        f"Training   : {len(train_df):,} records "
        f"({train_df['Year'].min()}-{train_df['Year'].max()})"
    )

    print(
        f"Validation : {len(validation_df):,} records "
        f"({validation_df['Year'].min()}-{validation_df['Year'].max()})"
    )

    print(
        f"Testing    : {len(test_df):,} records "
        f"({test_df['Year'].min()}-{test_df['Year'].max()})"
    )

    print(
        f"\nTotal      : "
        f"{len(train_df) + len(validation_df) + len(test_df):,}"
    )

    # ---------------------------------------------------------
    # Check year overlap
    # ---------------------------------------------------------

    train_years = set(train_df["Year"])
    validation_years = set(validation_df["Year"])
    test_years = set(test_df["Year"])

    print("\nYEAR OVERLAP CHECK")
    print("-" * 70)

    print(
        "Train ∩ Validation:",
        train_years.intersection(validation_years)
    )

    print(
        "Validation ∩ Test:",
        validation_years.intersection(test_years)
    )

    print(
        "Train ∩ Test:",
        train_years.intersection(test_years)
    )

    # ---------------------------------------------------------
    # Crop coverage
    # ---------------------------------------------------------

    print("\nCROP COVERAGE")
    print("-" * 70)

    crops = sorted(df["Crop"].unique())

    print(
        f"Total crops: {len(crops)}"
    )

    for crop in crops:

        train_count = (
            train_df["Crop"] == crop
        ).sum()

        validation_count = (
            validation_df["Crop"] == crop
        ).sum()

        test_count = (
            test_df["Crop"] == crop
        ).sum()

        print(
            f"{crop:25s} "
            f"Train={train_count:6,d}  "
            f"Validation={validation_count:5,d}  "
            f"Test={test_count:5,d}"
        )

    # ---------------------------------------------------------
    # Andhra Pradesh coverage
    # ---------------------------------------------------------

    print("\nANDHRA PRADESH COVERAGE")
    print("-" * 70)

    for name, dataset in [
        ("Training", train_df),
        ("Validation", validation_df),
        ("Test", test_df)
    ]:

        ap = dataset[
            dataset["State"] == "Andhra Pradesh"
        ]

        print(
            f"{name:12s}: "
            f"{len(ap):,} records | "
            f"{ap['District'].nunique()} districts | "
            f"{ap['Crop'].nunique()} crops"
        )

    # ---------------------------------------------------------
    # Final feature list
    # ---------------------------------------------------------

    print("\nFEATURES")
    print("-" * 70)

    print(
        "Input features:"
    )

    print(
        "Year, State, District, Crop, Area_1000_ha"
    )

    print(
        "\nTarget:"
    )

    print(
        "Yield_kg_per_ha"
    )

    print(
        "\nProduction is intentionally NOT used as a feature "
        "because yield is derived from production and area."
    )

    # ---------------------------------------------------------
    # Final confirmation
    # ---------------------------------------------------------

    print("\nFILES CREATED")
    print("-" * 70)

    print(
        TRAIN_FILE.resolve()
    )

    print(
        VALIDATION_FILE.resolve()
    )

    print(
        TEST_FILE.resolve()
    )

    print("\nPreparation completed successfully.")


if __name__ == "__main__":
    main()