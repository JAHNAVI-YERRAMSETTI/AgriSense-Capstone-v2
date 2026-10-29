import pandas as pd
from pathlib import Path

DATASET_PATH = Path("dld_yield_complete.csv")
REPORT_PATH = Path("dataset_analysis_report.txt")


def main():
    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATASET_PATH.resolve()}\n"
            "Place dld_yield_complete.csv in this folder."
        )

    df = pd.read_csv(DATASET_PATH)

    yield_cols = [
        col for col in df.columns
        if ".YIELD..Kg.per.ha." in col
    ]

    crop_names = [
        col.replace(".YIELD..Kg.per.ha.", "").replace(".", " ").title()
        for col in yield_cols
    ]

    lines = []

    lines.append("AGRISENSE - YIELD DATASET ANALYSIS")
    lines.append("=" * 60)
    lines.append("")

    lines.append(f"Rows: {len(df):,}")
    lines.append(f"Columns: {len(df.columns):,}")
    lines.append(f"Years: {df['Year'].min()} - {df['Year'].max()}")
    lines.append(f"Number of years: {df['Year'].nunique()}")
    lines.append(f"States: {df['State.Name'].nunique()}")
    lines.append(f"Districts: {df['Dist.Name'].nunique()}")
    lines.append(f"Duplicate rows: {df.duplicated().sum()}")
    lines.append("")

    lines.append("DATA TYPES")
    lines.append("-" * 60)
    lines.append(df.dtypes.to_string())
    lines.append("")

    lines.append("MISSING VALUES")
    lines.append("-" * 60)
    missing = df.isna().sum()
    missing = missing[missing > 0]
    if missing.empty:
        lines.append("No null/missing values detected.")
    else:
        lines.append(missing.to_string())
    lines.append("")

    lines.append("AVAILABLE STATES")
    lines.append("-" * 60)
    lines.append("\n".join(sorted(df["State.Name"].dropna().unique())))
    lines.append("")

    lines.append("YIELD COLUMNS / CROP COVERAGE")
    lines.append("-" * 60)

    coverage = []
    for yield_col, crop in zip(yield_cols, crop_names):
        values = pd.to_numeric(df[yield_col], errors="coerce")
        positive = int((values > 0).sum())
        zero = int((values == 0).sum())

        coverage.append({
            "Crop": crop,
            "Positive records": positive,
            "Zero records": zero,
            "Minimum positive yield": (
                values[values > 0].min() if positive else None
            ),
            "Maximum yield": (
                values[values > 0].max() if positive else None
            ),
            "Mean positive yield": (
                values[values > 0].mean() if positive else None
            )
        })

    coverage_df = pd.DataFrame(coverage)
    lines.append(coverage_df.to_string(index=False))
    lines.append("")

    lines.append("ANDHRA PRADESH COVERAGE")
    lines.append("-" * 60)

    ap = df[df["State.Name"].eq("Andhra Pradesh")]

    if ap.empty:
        lines.append("No Andhra Pradesh records found.")
    else:
        lines.append(f"Rows: {len(ap):,}")
        lines.append(f"Years: {ap['Year'].min()} - {ap['Year'].max()}")
        lines.append(f"Districts: {ap['Dist.Name'].nunique()}")
        lines.append("Districts:")
        lines.append(
            ", ".join(sorted(ap["Dist.Name"].dropna().unique()))
        )
        lines.append("")

        ap_coverage = []
        for yield_col, crop in zip(yield_cols, crop_names):
            values = pd.to_numeric(ap[yield_col], errors="coerce")
            positive = int((values > 0).sum())

            ap_coverage.append({
                "Crop": crop,
                "Positive AP records": positive
            })

        lines.append(
            pd.DataFrame(ap_coverage).to_string(index=False)
        )

    lines.append("")
    lines.append("IMPORTANT MODELING NOTE")
    lines.append("-" * 60)
    lines.append(
        "Production must NOT be used as an input feature when predicting "
        "yield because yield is mathematically derived from production and area."
    )
    lines.append(
        "The first model should therefore avoid target leakage and use only "
        "information available before/at prediction time."
    )
    lines.append(
        "The next step will transform the wide crop columns into a clean "
        "long-format dataset with Year, State, District, Crop, Area and Yield."
    )

    report = "\n".join(lines)
    REPORT_PATH.write_text(report, encoding="utf-8")

    print(report)
    print()
    print(f"Report saved to: {REPORT_PATH.resolve()}")


if __name__ == "__main__":
    main()
