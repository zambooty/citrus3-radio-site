## Deployment Constraints (HostGator PHP Hosting)
- **Static Export Only**: The site is deployed as static HTML/CSS/JS via `/out`. The `next.config.ts` must maintain `output: 'export'`, `trailingSlash: true`, and `images: { unoptimized: true }`.
- **No Node.js Server**: The host is a HostGator Hatchling plan (PHP only, no Node.js runtime). Do not use Next.js App Router API routes (`app/api/...`), Server Actions, or dynamic server rendering.
- **Dynamic Functionality**: All backend logic (auth, admin, uploads, artwork, etc.) must be implemented using PHP scripts placed in the `public/api/` directory so they are copied to the static export output.
- **Client-Side Fetching**: React components must fetch dynamic data client-side from the PHP API endpoints.
