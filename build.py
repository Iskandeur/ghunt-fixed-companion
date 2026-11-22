"""Packages the extension for the Chrome Web Store, Edge Add-ons and addons.mozilla.org."""
import json, pathlib, zipfile

root = pathlib.Path(__file__).parent
version = json.loads((root / "manifest.json").read_text(encoding="utf-8"))["version"]
out = root / "dist" / f"ghunt-fixed-companion-{version}.zip"
out.parent.mkdir(exist_ok=True)
files = ["manifest.json", "background.js", "LICENSE.md"]
files += [p.relative_to(root).as_posix() for d in ("popup", "pages", "icons") for p in (root / d).rglob("*") if p.is_file()]
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for f in files:
        z.write(root / f, f)
print(out)
