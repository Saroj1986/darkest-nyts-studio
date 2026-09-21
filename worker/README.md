# Darkest Nyts Render Worker

This is the local rendering stage for the app.

## Requirements

Install FFmpeg and ensure both `ffmpeg` and `ffprobe` are available on PATH.

## Render

Create a `project.json`:

```json
{
  "title": "Seat Number 17",
  "audio": "voice.mp3",
  "music": "ambient.mp3",
  "scenes": [
    {"image": "scene01.png", "duration": 10},
    {"image": "scene02.png", "duration": 10},
    {"image": "scene03.png", "duration": 10}
  ]
}
```

Then:

```bash
python worker/render_video.py project.json output.mp4
```

The worker normalizes scene images to 1920×1080, concatenates them, and mixes narration with optional low-volume background music.

## Next production enhancement

For the full Darkest Nyts renderer, add:
- animated Ken Burns zoom/pan
- burned-in captions from an SRT/VTT file
- logo intro/outro
- sound effects per scene
- automatic loudness normalization
- 9:16 Shorts rendering
- thumbnail generation
