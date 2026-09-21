
from pathlib import Path

# =========================
# PROJECT PATHS
# =========================

BACKEND = Path(r"D:\projects\WebNovels")
FRONTEND = Path(r"D:\projects\WebNovels\frontend")

OUTPUT = Path(r"D:\projects\WebNovels_full_dump_Now.txt")


# =========================
# SETTINGS
# =========================

EXTENSIONS = {
    ".py",
    ".tsx",
    ".ts",
    ".jsx",
    ".js",
    ".css",
    ".html",
    ".json",
    ".txt",
    ".md",
}

EXCLUDED_DIRS = {
    ".git",
    ".venv",
    "venv",
    "__pycache__",
    "node_modules",
    "dist",
    "build",
    ".idea",
    ".vscode",
    ".pytest_cache",
    "coverage",
    ".mypy_cache",
}

EXCLUDED_FILES = {
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
}


# =========================
# COLLECT FILES
# =========================

def collect_files(root: Path):
    files = []

    if not root.exists():
        print(f"WARNING: Path does not exist: {root}")
        return files

    for path in root.rglob("*"):
        if not path.is_file():
            continue

        # Skip excluded directories
        if any(part in EXCLUDED_DIRS for part in path.parts):
            continue

        # Skip excluded files
        if path.name in EXCLUDED_FILES:
            continue

        # Only selected extensions
        if path.suffix.lower() not in EXTENSIONS:
            continue

        files.append(path)

    return sorted(files)


# =========================
# WRITE DUMP
# =========================

all_files = []

for root in [BACKEND, FRONTEND]:
    all_files.extend(collect_files(root))


# Remove duplicates
all_files = sorted(set(all_files))


with OUTPUT.open("w", encoding="utf-8") as dump:

    dump.write("=" * 100 + "\n")
    dump.write("WEBNOVELS FULL PROJECT DUMP\n")
    dump.write("=" * 100 + "\n\n")

    dump.write("BACKEND:\n")
    dump.write(f"{BACKEND}\n\n")

    dump.write("FRONTEND:\n")
    dump.write(f"{FRONTEND}\n\n")

    dump.write(f"TOTAL FILES: {len(all_files)}\n\n")

    dump.write("=" * 100 + "\n\n")

    for index, file_path in enumerate(all_files, start=1):

        try:
            relative_path = file_path.relative_to(BACKEND)
        except ValueError:
            relative_path = file_path

        dump.write("\n")
        dump.write("#" * 100 + "\n")
        dump.write(f"# FILE {index}/{len(all_files)}\n")
        dump.write(f"# PATH: {relative_path}\n")
        dump.write("#" * 100 + "\n\n")

        try:
            content = file_path.read_text(
                encoding="utf-8",
                errors="replace",
            )

            dump.write(content)

        except Exception as error:
            dump.write(
                f"\n[ERROR READING FILE: {error}]\n"
            )

        dump.write("\n\n")


print()
print("=" * 60)
print("DUMP CREATED")
print("=" * 60)
print(f"Files included: {len(all_files)}")
print(f"Output: {OUTPUT}")
print("=" * 60)

