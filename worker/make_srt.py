#!/usr/bin/env python3
import json, sys
from pathlib import Path

def stamp(seconds):
    ms = int(round((seconds - int(seconds))*1000))
    total = int(seconds)
    h, total = divmod(total, 3600)
    m, s = divmod(total, 60)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"

if len(sys.argv) < 3:
    raise SystemExit("Usage: python make_srt.py project.json captions.srt")

data = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
out = []
t = 0.0
for i, scene in enumerate(data.get("scenes", []), 1):
    d = float(scene.get("duration", 5))
    text = str(scene.get("narration", "")).strip()
    if text:
        out.append(f"{i}\n{stamp(t)} --> {stamp(t+d)}\n{text}\n")
    t += d
Path(sys.argv[2]).write_text("\n".join(out), encoding="utf-8")
print(sys.argv[2])
