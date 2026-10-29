import pandas as pd
import numpy as np
from pathlib import Path

INPUT_FILE = Path("yield_long_format.csv")
OUTPUT_FILE = Path("yield_training_data.csv")
REPORT_FILE = Path("cleaning_report.txt")


def main():

    if not INPUT_FILE.exists():
        raise FileNotFoundError(
            f"Input file not found: {INPUT_FILE.resolve()}"
        )

    df = pd.read_csv(INPUT_FILE)

    original_count = len(df)

    # ---------------------------------------------------------
    # 1. Basic validity checks
    # ---------------------------------------------------------

    df = df.replace([np.inf, -np.inf], np.nan)

    df = df.dropna(
        subset=[
            "Year",
            "State",
            "District",
            "Crop",
            "Area_1000_ha",
            "Yield_kg_per_ha"
        ]
    )

    # Only meaningful agricultural observations
    df = df[
        (df["Area_1000_ha"] > 0) &
        (df["Yield_kg_per_ha"] > 0)
    ].copy()

    after_basic_filter = len(df)

    # ---------------------------------------------------------
    # 2. Crop-specific robust outlier filtering
    #
    # We use the 1st and 99th percentiles within each crop.
    # This avoids applying one yield threshold to all crops.
    # ---------------------------------------------------------

    cleaned_groups = []
    removed_outliers = []

    for crop, group in df.groupby("Crop", sort=False):

        lower_bound = group["Yield_kg_per_ha"].quantile(0.01)
        upper_bound = group["Yield_kg_per_ha"].quantile(0.99)

        mask = (
            (group["Yield_kg_per_ha"] >= lower_bound) &
            (group["Yield_kg_per_ha"] <= upper_bound)
        )

        cleaned = group[mask].copy()
        removed = group[~mask].copy()

        cleaned_groups.append(cleaned)

        if not removed.empty:
            removed = removed.copy()
            removed["Removal_Reason"] = (
                "Outside crop-specific 1st-99th percentile"
            )
            removed_outliers.append(removed)

    cleaned_df = pd.concat(
        cleaned_groups,
        ignore_index=True
    )

    if removed_outliers:
        removed_df = pd.concat(
            removed_outliers,
            ignore_index=True
        )
    else:
        removed_df = pd.DataFrame()

    # ---------------------------------------------------------
    # 3. Keep columns in a clean order
    # ---------------------------------------------------------

    cleaned_df = cleaned_df[
        [
            "Year",
            "State",
            "District",
            "Crop",
            "Area_1000_ha",
            "Yield_kg_per_ha"
        ]
    ]

    cleaned_df = cleaned_df.sort_values(
        [
            "Year",
            "State",
            "District",
            "Crop"
        ]
    ).reset_index(drop=True)

    # ---------------------------------------------------------
    # 4. Save cleaned dataset
    # ---------------------------------------------------------

    cleaned_df.to_csv(
        OUTPUT_FILE,
        index=False
    )

    # ---------------------------------------------------------
    # 5. Generate cleaning report
    # ---------------------------------------------------------

    report = []

    report.append(
        "AGRISENSE - YIELD DATA CLEANING REPORT"
    )
    report.append("=" * 70)
    report.append("")

    report.append(
        f"Original records: {original_count:,}"
    )

    report.append(
        f"After basic validity filtering: "
        f"{after_basic_filter:,}"
    )

    report.append(
        f"Final training records: "
        f"{len(cleaned_df):,}"
    )

    report.append(
        f"Total records removed: "
        f"{original_count - len(cleaned_df):,}"
    )

    report.append("")

    report.append(
        "REMOVAL METHOD"
    )
    report.append("-" * 70)
    report.append(
        "1. Removed missing/non-finite values."
    )
    report.append(
        "2. Removed records with non-positive area."
    )
    report.append(
        "3. Removed records with non-positive yield."
    )
    report.append(
        "4. Applied crop-specific 1st and 99th percentile "
        "yield bounds."
    )

    report.append("")
    report.append(
        "CROP-WISE FINAL RECORD COUNTS"
    )
    report.append("-" * 70)

    crop_counts = (
        cleaned_df["Crop"]
        .value_counts()
        .sort_index()
    )

    report.append(
        crop_counts.to_string()
    )

    report.append("")
    report.append(
        "CROP-WISE YIELD STATISTICS"
    )
    report.append("-" * 70)

    statistics = (
        cleaned_df
        .groupby("Crop")["Yield_kg_per_ha"]
        .agg(
            Count="count",
            Minimum="min",
            Median="median",
            Mean="mean",
            Maximum="max"
        )
        .round(2)
    )

    report.append(
        statistics.to_string()
    )

    report.append("")
    report.append(
        "ANDHRA PRADESH CHECK"
    )
    report.append("-" * 70)

    ap = cleaned_df[
        cleaned_df["State"] == "Andhra Pradesh"
    ]

    report.append(
        f"Final Andhra Pradesh records: {len(ap):,}"
    )

    report.append(
        f"AP districts: {ap['District'].nunique()}"
    )

    report.append(
        f"AP crops: {ap['Crop'].nunique()}"
    )

    report.append("")
    report.append(
        "AP crop counts:"
    )

    report.append(
        ap["Crop"]
        .value_counts()
        .sort_index()
        .to_string()
    )

    report.append("")
    report.append(
        "REMOVED EXTREME RECORDS"
    )
    report.append("-" * 70)

    if removed_df.empty:
        report.append(
            "No records were removed by the percentile filter."
        )
    else:
        report.append(
            f"Records removed by percentile filtering: "
            f"{len(removed_df):,}"
        )

        report.append("")
        report.append(
            removed_df[
                [
                    "Year",
                    "State",
                    "District",
                    "Crop",
                    "Area_1000_ha",
                    "Yield_kg_per_ha"
                ]
            ]
            .nlargest(
                30,
                "Yield_kg_per_ha"
            )
            .to_string(index=False)
        )

    REPORT_FILE.write_text(
        "\n".join(report),
        encoding="utf-8"
    )

    # ---------------------------------------------------------
    # 6. Console summary
    # ---------------------------------------------------------

    print("=" * 70)
    print("AGRISENSE - YIELD DATA CLEANING")
    print("=" * 70)

    print(
        f"\nOriginal records: {original_count:,}"
    )

    print(
        f"After basic filtering: {after_basic_filter:,}"
    )

    print(
        f"Final training records: {len(cleaned_df):,}"
    )

    print(
        f"Removed records: "
        f"{original_count - len(cleaned_df):,}"
    )

    print("\nFinal crop counts:")
    print(crop_counts.to_string())

    print("\nFinal yield statistics:")
    print(statistics.to_string())

    print(
        f"\nFinal Andhra Pradesh records: "
        f"{len(ap):,}"
    )

    print(
        f"Cleaning report saved to: "
        f"{REPORT_FILE.resolve()}"
    )

    print(
        f"Training dataset saved to: "
        f"{OUTPUT_FILE.resolve()}"
    )


if __name__ == "__main__":
    main()