# Darkest Nyts Studio — production architecture

## Current V0.8

The application now has a durable development job queue:

Browser
→ Next.js API
→ projects/jobs/*.json
→ local worker
→ FFmpeg / asset / YouTube stages

### Job lifecycle

`queued → running → awaiting_worker → completed`

Failures should eventually become:

`running → failed → retry`

## Scheduling

Jobs can be created with an ISO timestamp. The web UI can schedule a production job.

For development:

```bash
python worker/job_runner.py
```

For production, replace the JSON queue with Redis/BullMQ, Cloud Tasks, SQS, or another managed queue.

## Recommended production stack

- Next.js: web/API
- PostgreSQL: users, channels, projects, jobs, approvals
- S3-compatible storage: scene images, audio, MP4, thumbnails
- Redis/BullMQ: asynchronous jobs
- FFmpeg worker: video rendering
- OpenAI: script/TTS/image generation
- Google OAuth + YouTube Data API: publishing
- Cron/managed scheduler: recurring jobs
- Sentry/OpenTelemetry: error tracking

## Security

Never expose:
- OpenAI API key
- Google client secret
- YouTube refresh token

Store secrets server-side. Encrypt OAuth refresh tokens at rest in a multi-user deployment.

## Publishing gate

Recommended states:

`draft → generated → review → approved → scheduled → uploading → published`

Only `approved` projects should be eligible for automatic public publishing.
