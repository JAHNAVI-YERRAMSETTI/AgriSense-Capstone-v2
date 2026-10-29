import pandas as pd
from pathlib import Path

INPUT_FILE = Path("dld_yield_complete.csv")
OUTPUT_FILE = Path("yield_long_format.csv")

# Individual crop categories we want to model first.
# Aggregate categories are intentionally excluded.
CROPS = {
    "RICE": "Rice",
    "WHEAT": "Wheat",
    "KHARIF.SORGHUM": "Kharif Sorghum",
    "RABI.SORGHUM": "Rabi Sorghum",
    "PEARL.MILLET": "Pearl Millet",
    "MAIZE": "Maize",
    "FINGER.MILLET": "Finger Millet",
    "BARLEY": "Barley",
    "CHICKPEA": "Chickpea",
    "PIGEONPEA": "Pigeonpea",
    "GROUNDNUT": "Groundnut",
    "SESAMUM": "Sesamum",
    "RAPESEED.AND.MUSTARD": "Rapeseed And Mustard",
    "SAFFLOWER": "Safflower",
    "CASTOR": "Castor",
    "LINSEED": "Linseed",
    "SUNFLOWER": "Sunflower",
    "SOYABEAN": "Soyabean",
    "SUGARCANE": "Sugarcane",
    "COTTON": "Cotton",
}


def main():

    if not INPUT_FILE.exists():
        raise FileNotFoundError(
            f"Dataset not found: {INPUT_FILE.resolve()}"
        )

    df = pd.read_csv(INPUT_FILE)

    records = []

    for prefix, crop_name in CROPS.items():

        area_column = f"{prefix}.AREA..1000.ha."
        yield_column = f"{prefix}.YIELD..Kg.per.ha."

        if area_column not in df.columns:
            print(f"Skipping {crop_name}: area column not found")
            continue

        if yield_column not in df.columns:
            print(f"Skipping {crop_name}: yield column not found")
            continue

        crop_df = df[
            [
                "Year",
                "State.Name",
                "Dist.Name",
                area_column,
                yield_column
            ]
        ].copy()

        crop_df.columns = [
            "Year",
            "State",
            "District",
            "Area_1000_ha",
            "Yield_kg_per_ha"
        ]

        crop_df["Crop"] = crop_name

        # Convert to numeric explicitly
        crop_df["Area_1000_ha"] = pd.to_numeric(
            crop_df["Area_1000_ha"],
            errors="coerce"
        )

        crop_df["Yield_kg_per_ha"] = pd.to_numeric(
            crop_df["Yield_kg_per_ha"],
            errors="coerce"
        )

        # Keep only observations where the crop was actually cultivated
        crop_df = crop_df[
            (crop_df["Area_1000_ha"] > 0) &
            (crop_df["Yield_kg_per_ha"] > 0)
        ]

        records.append(crop_df)

    if not records:
        raise RuntimeError("No crop data could be prepared.")

    result = pd.concat(
        records,
        ignore_index=True
    )

    # Arrange columns
    result = result[
        [
            "Year",
            "State",
            "District",
            "Crop",
            "Area_1000_ha",
            "Yield_kg_per_ha"
        ]
    ]

    # Sort for easier inspection
    result = result.sort_values(
        ["Year", "State", "District", "Crop"]
    ).reset_index(drop=True)

    result.to_csv(
        OUTPUT_FILE,
        index=False
    )

    print("=" * 60)
    print("AGRISENSE - YIELD DATA PREPARATION")
    print("=" * 60)

    print(f"\nOriginal rows: {len(df):,}")
    print(f"Prepared rows: {len(result):,}")
    print(f"Crops: {result['Crop'].nunique()}")
    print(f"States: {result['State'].nunique()}")
    print(f"Districts: {result['District'].nunique()}")
    print(
        f"Years: {result['Year'].min()} - "
        f"{result['Year'].max()}"
    )

    print("\nCrop counts:")
    print(
        result["Crop"]
        .value_counts()
        .to_string()
    )

    print("\nYield statistics:")
    print(
        result["Yield_kg_per_ha"]
        .describe()
        .to_string()
    )

    print("\nTop 20 highest yield records:")
    print(
        result.nlargest(
            20,
            "Yield_kg_per_ha"
        ).to_string(index=False)
    )

    print("\nAndhra Pradesh records:")
    ap = result[
        result["State"] == "Andhra Pradesh"
    ]

    print(f"Rows: {len(ap):,}")

    print("\nAndhra Pradesh crop counts:")
    print(
        ap["Crop"]
        .value_counts()
        .to_string()
    )

    print("\nOutput:")
    print(OUTPUT_FILE.resolve())

    print("\nPreparation completed successfully.")


if __name__ == "__main__":
    main()