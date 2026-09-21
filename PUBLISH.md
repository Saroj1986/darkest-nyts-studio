# Publish Darkest Nyts Studio

## A. Publish the web app

### Easiest method
1. Create a GitHub repository.
2. Upload this project to the repository.
3. Open Vercel and import the GitHub repository.
4. Vercel detects Next.js automatically.
5. Add the environment variables from `.env.production.example`.
6. Deploy.

Vercel supports Next.js directly and can automatically build/deploy a Next.js project.

### Important
The web/API layer is deployable on Vercel, but the current FFmpeg worker should run separately. Do not depend on a Vercel request for a long-running video render.

## B. Connect YouTube

1. In Google Cloud Console create/select a project.
2. Enable **YouTube Data API v3**.
3. Create OAuth 2.0 credentials for a **Web application**.
4. Add your production callback URL:

`https://YOUR-APP.vercel.app/api/youtube/callback`

5. Put the client ID and secret into Vercel environment variables.
6. Set:

`GOOGLE_REDIRECT_URI=https://YOUR-APP.vercel.app/api/youtube/callback`

7. Deploy/redeploy.
8. Open:

`https://YOUR-APP.vercel.app/api/youtube/auth`

9. Sign in with the Google account that owns the YouTube channel.
10. Approve the `youtube.upload` permission.
11. The callback returns a refresh token in the local-development implementation. Store it only as a server-side secret.

YouTube write operations use OAuth 2.0. The `videos.insert` method uploads the video and can set metadata and privacy status.

## C. First upload

Keep the first upload **private**.

Recommended flow:
1. Generate a video.
2. Render the MP4 on the worker.
3. Review the MP4 and thumbnail.
4. Upload as private.
5. Check the video in YouTube Studio.
6. Only then enable a public/scheduled publishing workflow.

YouTube notes that uploads from unverified API projects created after July 28, 2020 are restricted to private viewing until the project completes the relevant audit.

## D. Production architecture

For a real always-on service:

Vercel
  → Next.js dashboard/API
  → PostgreSQL
  → Object storage
  → Redis/BullMQ
  → FFmpeg worker
  → OpenAI
  → YouTube Data API

The current local JSON queue should be replaced by a database + queue before multi-user production.

## E. Security

Never put these in browser code:
- OPENAI_API_KEY
- GOOGLE_CLIENT_SECRET
- YOUTUBE_REFRESH_TOKEN

Use Vercel environment variables for web/API secrets and encrypted server-side storage for multi-user OAuth tokens.
