from pathlib import Path
from zipfile import ZipFile

ZIP_PATH = Path("dataset/PlantVillage/data.zip")
SPLIT_DIR = Path("dataset/PlantVillage/splits")
OUTPUT_DIR = Path("dataset/processed")

TRAIN_SPLIT = SPLIT_DIR / "color_train.txt"
TEST_SPLIT = SPLIT_DIR / "color_test.txt"


def read_split(split_file):
    with open(split_file, "r", encoding="utf-8") as file:
        return [
            line.strip()
            for line in file
            if line.strip()
        ]


def extract_split(zip_file, split_file, split_name):
    paths = read_split(split_file)

    output_root = OUTPUT_DIR / split_name
    output_root.mkdir(parents=True, exist_ok=True)

    extracted = 0

    for relative_path in paths:
        class_name = Path(relative_path).parent.name
        file_name = Path(relative_path).name

        destination_dir = output_root / class_name
        destination_dir.mkdir(parents=True, exist_ok=True)

        destination_file = destination_dir / file_name

        if destination_file.exists():
            extracted += 1
            continue

        with zip_file.open(relative_path) as source:
            with open(destination_file, "wb") as destination:
                destination.write(source.read())

        extracted += 1

        if extracted % 500 == 0:
            print(
                f"{split_name}: "
                f"{extracted}/{len(paths)} images processed"
            )

    print(
        f"{split_name} extraction complete: "
        f"{extracted} images"
    )


def main():
    print("Preparing PlantVillage color dataset...")
    print(f"ZIP: {ZIP_PATH}")
    print(f"Output: {OUTPUT_DIR}")

    train_paths = read_split(TRAIN_SPLIT)
    test_paths = read_split(TEST_SPLIT)

    print(f"\nTrain images: {len(train_paths)}")
    print(f"Test images: {len(test_paths)}")
    print(f"Total images: {len(train_paths) + len(test_paths)}")

    with ZipFile(ZIP_PATH, "r") as zip_file:
        extract_split(
            zip_file,
            TRAIN_SPLIT,
            "train"
        )

        extract_split(
            zip_file,
            TEST_SPLIT,
            "test"
        )

    print("\nDataset preparation completed successfully.")


if __name__ == "__main__":
    main()