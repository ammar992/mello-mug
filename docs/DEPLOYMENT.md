# Deployment Guide

## 1. Vercel

1. Push the repository to GitHub and import it in Vercel. The framework is detected as Next.js automatically.
2. Under **Settings → Environment Variables (Production)**, add:
   - `NEXT_PUBLIC_SITE_URL` (e.g. `https://www.mellowmug.com`)
   - `MONGODB_URI`, `MONGODB_DB=mellow-mug`
   - `AUTH_SECRET`: generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER=mellow-mug`
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` (shown on the login page with a "Use this" button; add `SHOW_DEMO_CREDENTIALS=false` to hide it)
3. Confirm **Settings → Git → Production Branch** is `main`, then deploy.
4. If the production database is empty, run the seeds once from your machine with production values in `.env.local`:
   ```bash
   npm run seed:admin
   npm run seed
   ```

## 2. MongoDB Atlas

Under **Network Access**, allow `0.0.0.0/0` (Vercel uses dynamic IPs), or use the Vercel ↔ Atlas integration. Give the database user `readWrite` on `mellow-mug` only.

## 3. Custom domain

In **Vercel → Project → Domains**, add `mellowmug.com` and `www.mellowmug.com`, then create the records Vercel shows at your DNS provider. They are typically:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

Don't touch existing `MX` or email `TXT` records. HTTPS certificates are issued automatically.

## 4. Google Maps

You don't need an API key. In the admin, under **Hours, location & footer**, either:

- enter the **address** (or a **map search** like "Mellow Mug, Springfield"), or
- for an exact pin, open Google Maps → **Share → Embed a map**, and paste only the `https://www.google.com/maps/embed?...` URL from the code.

## 5. After launch

- [ ] Sign in at `/admin` and change the password (**Settings**)
- [ ] Replace the sample menu, prices, and photos (**Menu & prices**)
- [ ] Replace the sample team and photos (**Team**)
- [ ] Enter the real address, phone, email, hours, and socials
- [ ] Submit `/sitemap.xml` in Google Search Console
