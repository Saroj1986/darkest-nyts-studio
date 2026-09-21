#!/usr/bin/env python3
"""
Build a complete local project folder from a project.json.
This creates placeholder asset directories and an assembly manifest.

It intentionally does not invent or download copyrighted media.
"""
import json, sys
from pathlib import Path

if len(sys.argv)<2:
    raise SystemExit("Usage: python build_project.py project.json")

project=Path(sys.argv[1]).resolve()
data=json.loads(project.read_text(encoding="utf-8"))
root=project.parent
for folder in ["assets/scenes","assets/audio","assets/music","assets/sfx","exports","shorts","captions"]:
    (root/folder).mkdir(parents=True,exist_ok=True)

# Generate a render manifest with expected file locations.
for scene in data.get("scenes",[]):
    n=int(scene["number"])
    scene["image"]=str(root/"assets/scenes"/f"scene_{n:03}.png")

manifest=root/"render_manifest.json"
manifest.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding="utf-8")
print(manifest)
