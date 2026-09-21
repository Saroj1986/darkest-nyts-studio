# V0.9.3 build fix

The previous V0.9.2 package had one incorrect relative import in `app/api/jobs/run/route.ts`.

Directory depth:
`app/api/jobs/run/route.ts` -> repository root requires **four** `..` segments.

Correct:
`import {listJobs,updateJob} from "../../../../lib/jobStore";`

Other routes:
- `app/api/jobs/route.ts` -> `../../../lib/jobStore`
- `app/api/production/route.ts` -> `../../../lib/projectStore`
- `app/api/project/route.ts` -> `../../../lib/projectStore`

No `@/lib/*` imports remain in application TypeScript files.
