import pandas as pd
from pathlib import Path

INPUT_FILE = Path("yield_long_format.csv")
OUTPUT_FILE = Path("yield_outlier_audit.csv")


def main():

    if not INPUT_FILE.exists():
        raise FileNotFoundError(
            f"File not found: {INPUT_FILE.resolve()}"
        )

    df = pd.read_csv(INPUT_FILE)

    results = []

    for crop, group in df.groupby("Crop"):

        q1 = group["Yield_kg_per_ha"].quantile(0.25)
        q3 = group["Yield_kg_per_ha"].quantile(0.75)

        iqr = q3 - q1

        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr

        outliers = group[
            (group["Yield_kg_per_ha"] < lower) |
            (group["Yield_kg_per_ha"] > upper)
        ]

        results.append({
            "Crop": crop,
            "Records": len(group),
            "Q1": q1,
            "Median": group["Yield_kg_per_ha"].median(),
            "Q3": q3,
            "IQR": iqr,
            "Lower_Bound": lower,
            "Upper_Bound": upper,
            "Minimum": group["Yield_kg_per_ha"].min(),
            "Maximum": group["Yield_kg_per_ha"].max(),
            "Outlier_Count": len(outliers),
            "Outlier_Percentage": (
                len(outliers) / len(group) * 100
            )
        })

    audit = pd.DataFrame(results)

    audit = audit.sort_values(
        "Outlier_Percentage",
        ascending=False
    )

    audit.to_csv(
        OUTPUT_FILE,
        index=False
    )

    print("=" * 70)
    print("AGRISENSE - YIELD OUTLIER AUDIT")
    print("=" * 70)

    pd.set_option(
        "display.max_columns",
        None
    )

    print("\nCrop-wise analysis:")
    print(
        audit.to_string(index=False)
    )

    print("\n\nTOP EXTREME RECORDS")
    print("-" * 70)

    extreme = df.nlargest(
        30,
        "Yield_kg_per_ha"
    )

    print(
        extreme[
            [
                "Year",
                "State",
                "District",
                "Crop",
                "Area_1000_ha",
                "Yield_kg_per_ha"
            ]
        ].to_string(index=False)
    )

    print("\n\nLOW-AREA EXTREME RECORDS")
    print("-" * 70)

    low_area = df[
        df["Area_1000_ha"] <= 0.10
    ].nlargest(
        30,
        "Yield_kg_per_ha"
    )

    print(
        low_area[
            [
                "Year",
                "State",
                "District",
                "Crop",
                "Area_1000_ha",
                "Yield_kg_per_ha"
            ]
        ].to_string(index=False)
    )

    print("\n")
    print(
        f"Audit saved to: {OUTPUT_FILE.resolve()}"
    )


if __name__ == "__main__":
    main()