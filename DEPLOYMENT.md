# Darkest Nyts Studio deployment checklist

## Local

1. `npm install`
2. Copy `.env.example` to `.env.local`
3. Add `OPENAI_API_KEY`
4. Add Google OAuth web credentials.
5. Set `GOOGLE_REDIRECT_URI` to:
   `http://localhost:3000/api/youtube/callback`
6. Enable YouTube Data API v3 in Google Cloud.
7. Start with `npm run dev`.

## YouTube OAuth

Click **Connect YouTube** in the app. Google OAuth is used for the `youtube.upload` scope. The callback returns a refresh token for local development. Store it only in the server environment.

YouTube's API requires OAuth for insert/update/delete operations. `videos.insert` uploads the video and accepts metadata such as title, description, tags and privacy status.

## Production security

Do not expose `YOUTUBE_REFRESH_TOKEN` or `GOOGLE_CLIENT_SECRET` to the browser.

For a multi-user SaaS:
- encrypt refresh tokens at rest
- associate tokens with a user/channel in PostgreSQL
- use a secure session layer
- use object storage rather than local paths
- use a background queue for uploads
- implement resumable uploads
- audit/log publishing actions
- add an explicit approval state before publishing

## YouTube API caveat

Google currently notes that videos uploaded by unverified API projects created after July 28, 2020 are restricted to private viewing until the project passes the required audit. Treat `private` as the safe initial publishing mode.

## Deployment architecture

Browser
  -> Next.js app
  -> PostgreSQL (projects/jobs/tokens)
  -> S3-compatible object storage (assets)
  -> Redis/BullMQ (jobs)
  -> FFmpeg worker
  -> YouTube Data API
