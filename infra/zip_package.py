import sys
import zipfile
from pathlib import Path


def main() -> None:
    src_dir = Path(sys.argv[1])
    dest_zip = Path(sys.argv[2])
    dest_zip.parent.mkdir(parents=True, exist_ok=True)
    if dest_zip.exists():
        dest_zip.unlink()

    with zipfile.ZipFile(dest_zip, "w", zipfile.ZIP_DEFLATED) as zf:
        for file_path in src_dir.rglob("*"):
            if file_path.is_file():
                zf.write(file_path, file_path.relative_to(src_dir))

    print(f"Wrote {dest_zip}")


if __name__ == "__main__":
    main()
