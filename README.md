# Mellow Mug — Coffee Shop Website & CMS

A warm, 3D-animated coffee shop website with a custom admin dashboard. Every public-facing piece of content is managed from `/admin`: menu and prices, photos, story, team, opening hours, location, socials, and footer.

## Highlights

- **3D hero:** a React Three Fiber coffee cup (lathe-turned mug, latte art, rising steam, floating beans) that follows the mouse. An SVG illustration replaces it on low-power devices and when reduced motion is enabled.
- **Bean-to-cup scroll animation:** a pinned, GSAP ScrollTrigger-scrubbed scene with 7 steps (beans → grinder → portafilter → hot water → pour → steam → final cup), with a moving camera. It's SVG, so it stays light on mobile. Reduced motion shows a static step list.
- **Menu:** category tabs with animated, filterable cards, a best-sellers list with a cursor-following photo, plus story, team, and visit (map + live "today" hours) sections.
- **Admin:**
  - Dashboard overview
  - Homepage text and animation captions
  - Menu categories and items, with inline price edits and featured/best-seller toggles
  - Story, team, hours/location/map/socials/footer
  - Cloudinary media library and settings

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Motion · GSAP ScrollTrigger · Lenis · React Three Fiber · MongoDB (Mongoose) · Cloudinary · Zod · JWT sessions (jose) + bcrypt

## Setup

```bash
npm install
cp .env.example .env.local     # fill in MongoDB, Cloudinary, AUTH_SECRET, ADMIN_EMAIL/ADMIN_PASSWORD
npm run seed:admin             # creates the admin from ADMIN_EMAIL / ADMIN_PASSWORD
npm run seed                   # default page content, sample menu and team (safe to re-run)
npm run dev                    # http://localhost:3000  ·  admin at /admin
```

| Script | Purpose |
| --- | --- |
| `npm run seed:admin` | Create the initial admin. Refuses to create a duplicate. `-- --reset` resets that admin's password |
| `npm run seed` | Insert missing content, menu, and team. `-- --force` replaces everything with the defaults |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` / `npm run typecheck` | Quality checks |

## Environment variables

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public URL (metadata, sitemap) |
| `MONGODB_URI`, `MONGODB_DB` | MongoDB Atlas connection; database defaults to `mellow-mug` |
| `AUTH_SECRET` | 32+ random characters; signs admin sessions |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Initial admin. Also shown with a "Use this" button on the login page. Set `SHOW_DEMO_CREDENTIALS=false` to hide it |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Image uploads |
| `CLOUDINARY_FOLDER` | Defaults to `mellow-mug`. The CMS only manages assets inside this folder |

## Structure

```
src/
  app/(site)/            public homepage
  app/admin/login        sign-in
  app/admin/(panel)/     dashboard, homepage, menu, story, team, contact, media, settings
  app/api/admin/*        protected APIs (content, categories, menu-items, team, media, auth)
  components/sections/   Hero, BrewingScene, Menu, Best sellers, Story, Team, Visit
  components/three/      3D cup scene + fallback illustration
  components/admin/      CMS UI kit (fields, list editor, media picker, confirm dialogs)
  lib/content/           Zod schemas, defaults/seed data, loaders
  lib/crud.ts            generic CRUD + reorder handlers for ordered collections
  proxy.ts               route protection for /admin and /api/admin
scripts/                 create-admin.mjs, seed.mjs
docs/                    DEPLOYMENT.md, ADMIN-GUIDE.md
```

Public pages are statically rendered. Every admin save calls `revalidatePath`, so changes show on the next visit. If the database is ever unreachable, page text falls back to the defaults.

## Security

- bcrypt (cost 12) password hashes and an httpOnly `SameSite=Lax` JWT session cookie.
- Sessions are re-validated against the database on every admin request; a password change signs out all other sessions.
- Login is rate-limited (8 attempts per 15 minutes per IP) and all mutations check the request origin.
- Uploads are signed server-side; uploaded assets are verified with Cloudinary's Admin API.

Placeholder photos are from [Unsplash](https://unsplash.com) (Unsplash License). Replace them, along with the sample menu, prices, and team, from the dashboard.
