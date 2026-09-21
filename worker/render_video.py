#!/usr/bin/env python3
"""
Darkest Nyts local render worker.

Input:
  project.json containing:
  {
    "title": "...",
    "audio": "voice.mp3",
    "scenes": [
      {"image": "scene01.png", "duration": 10, "narration": "..."}
    ],
    "music": "music.mp3"   # optional
  }

Output:
  output.mp4

Requires:
  Python 3.10+
  ffmpeg + ffprobe on PATH

This worker intentionally uses local assets. It does not upload or publish
anything automatically.
"""
import json, os, subprocess, sys, tempfile
from pathlib import Path

def run(cmd):
    print("$", " ".join(map(str, cmd)))
    subprocess.run(cmd, check=True)

def main():
    if len(sys.argv) < 2:
        print("Usage: python render_video.py project.json [output.mp4]")
        raise SystemExit(2)

    project = Path(sys.argv[1]).resolve()
    output = Path(sys.argv[2] if len(sys.argv) > 2 else "output.mp4").resolve()
    data = json.loads(project.read_text(encoding="utf-8"))
    scenes = data.get("scenes", [])
    if not scenes:
        raise SystemExit("No scenes in project.json")

    with tempfile.TemporaryDirectory(prefix="darkest-nyts-") as td:
        td = Path(td)
        concat = td / "concat.txt"

        lines = []
        for i, scene in enumerate(scenes, 1):
            image = Path(scene["image"]).resolve()
            duration = float(scene.get("duration", 5))
            if not image.exists():
                raise SystemExit(f"Missing image: {image}")

            # Normalize every scene to 1920x1080 for YouTube.
            normalized = td / f"scene_{i:03d}.mp4"
            run([
                "ffmpeg", "-y", "-loop", "1", "-i", str(image),
                "-t", str(duration),
                "-vf",
                "scale=1920:1080:force_original_aspect_ratio=decrease,"
                "pad=1920:1080:(ow-iw)/2:(oh-ih)/2,"
                "format=yuv420p",
                "-r", "30", "-an", str(normalized)
            ])
            lines.append(f"file '{normalized.as_posix()}'")

        concat.write_text("\n".join(lines), encoding="utf-8")
        visual = td / "visual.mp4"
        run([
            "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat),
            "-c", "copy", str(visual)
        ])

        audio = data.get("audio")
        if not audio:
            # Visual-only fallback.
            shutil.copy2(visual, output)
            print(f"Created {output}")
            return

        audio = Path(audio).resolve()
        if not audio.exists():
            raise SystemExit(f"Missing audio: {audio}")

        # Optional background music. It is mixed quietly under narration.
        music = data.get("music")
        if music and Path(music).exists():
            music = str(Path(music).resolve())
            run([
                "ffmpeg", "-y",
                "-i", str(visual), "-i", str(audio), "-stream_loop", "-1", "-i", music,
                "-filter_complex",
                "[1:a]volume=1.0[narr];[2:a]volume=0.10[music];"
                "[narr][music]amix=inputs=2:duration=first:dropout_transition=2[a]",
                "-map", "0:v:0", "-map", "[a]",
                "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                "-c:a", "aac", "-b:a", "192k", "-shortest", str(output)
            ])
        else:
            run([
                "ffmpeg", "-y", "-i", str(visual), "-i", str(audio),
                "-map", "0:v:0", "-map", "1:a:0",
                "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                "-c:a", "aac", "-b:a", "192k", "-shortest", str(output)
            ])

        print(f"Created {output}")

if __name__ == "__main__":
    main()
