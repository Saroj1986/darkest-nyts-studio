#!/usr/bin/env python3
"""
Render a 9:16 YouTube Short from scene images + narration.

Usage:
  python worker/render_shorts.py project.json short.mp4

Requires ffmpeg on PATH.
"""
import json, subprocess, sys, tempfile
from pathlib import Path

def run(cmd):
    print("$", " ".join(map(str, cmd)))
    subprocess.run(cmd, check=True)

def main():
    if len(sys.argv) < 3:
        raise SystemExit("Usage: python render_shorts.py project.json short.mp4")
    data = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    output = Path(sys.argv[2]).resolve()
    scenes = data.get("scenes", [])
    if not scenes:
        raise SystemExit("No scenes")

    with tempfile.TemporaryDirectory(prefix="darkest-short-") as td:
        td = Path(td)
        concat = td / "concat.txt"
        lines=[]
        for i, s in enumerate(scenes, 1):
            image=Path(s["image"]).resolve()
            duration=float(s.get("duration",5))
            out=td/f"s{i:03}.mp4"
            # Vertical crop/scale, preserving a cinematic center.
            run(["ffmpeg","-y","-loop","1","-i",str(image),"-t",str(duration),
                 "-vf","scale=1080:1920:force_original_aspect_ratio=increase,"
                      "crop=1080:1920,format=yuv420p",
                 "-r","30","-an",str(out)])
            lines.append(f"file '{out.as_posix()}'")
        concat.write_text("\n".join(lines),encoding="utf-8")
        visual=td/"visual.mp4"
        run(["ffmpeg","-y","-f","concat","-safe","0","-i",str(concat),"-c","copy",str(visual)])

        audio=data.get("audio")
        if audio and Path(audio).exists():
            run(["ffmpeg","-y","-i",str(visual),"-i",str(Path(audio).resolve()),
                 "-map","0:v:0","-map","1:a:0","-c:v","libx264","-crf","21",
                 "-preset","medium","-c:a","aac","-b:a","160k","-shortest",str(output)])
        else:
            shutil.copy2(visual,output)
        print("Created",output)

if __name__=="__main__":
    main()
