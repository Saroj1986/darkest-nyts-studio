# Darkest Nyts Studio — V0.7 YouTube Integration

V0.7 adds a real Google OAuth + YouTube upload integration skeleton.

## Current pipeline

Topic → AI Script → Scenes → AI Voice → AI Images → Captions → FFmpeg → Shorts → Thumbnail → **YouTube OAuth → Upload**

### YouTube integration
- `/api/youtube/auth` starts OAuth
- `/api/youtube/callback` receives the authorization code
- `/api/youtube/status` checks the authenticated channel
- `/api/youtube/publish` uploads a server-side video file

The upload endpoint defaults to **private** unless explicitly passed `unlisted` or `public`. Keep a human approval step before public publishing.

YouTube requires OAuth 2.0 for write operations such as uploads. The `videos.insert` API supports video metadata and upload media. Google also documents a restriction where uploads from unverified API projects created after July 28, 2020 remain private until the project passes the relevant audit. citeturn0search0turn0search1

OpenAI model defaults are configured as `gpt-5.6-luna`, `gpt-4o-mini-tts`, and `gpt-image-2`; OpenAI's current model catalog lists GPT-5.6 Luna, GPT-4o Mini TTS, and GPT-Image-2. citeturn1search0

## Install

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open `http://localhost:3000`.

See `DEPLOYMENT.md` for Google Cloud and production-security steps.


## V0.8 Job queue

The project now includes:
- `POST /api/jobs` to create a scheduled job
- `GET /api/jobs` to list jobs
- `POST /api/jobs/run` to claim a due job
- `worker/job_runner.py` for local development
- Queue UI for scheduling and monitoring production jobs

This is a development queue. For a real SaaS deployment, replace the local JSON queue with PostgreSQL + Redis/BullMQ or a managed job system.


## V0.9.1 build fix

If Vercel/Turbopack reports:

`Module not found: Can't resolve '@/lib/jobStore'`

the project now includes the missing TypeScript path mapping and the server routes use relative imports as an additional safeguard.

After replacing the repository files, trigger a fresh deployment. If Vercel still uses an old build cache, use **Redeploy → Clear build cache**.
