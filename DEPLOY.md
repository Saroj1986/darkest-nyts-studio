# Very simple deployment steps

1. Download and extract this ZIP.
2. Open the extracted folder.
3. Open Terminal in that folder.
4. Run:
   npm install
5. Run:
   npm run check:imports
6. You MUST see:
   Import check passed.
7. Run:
   npm run build
8. If build succeeds, push the exact folder to GitHub.
9. Vercel will deploy the new commit.
10. In Vercel, verify the deployment commit is the same commit you just pushed.

Do not merge this with old versions. Replace the repository contents.
