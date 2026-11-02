# Colby Choir — Landing Site

Single-page landing site for **Colby Choir**, a young men's a cappella group based in Houston, TX.
Plain HTML/CSS/JS — no build step, no dependencies.

## Run it

Open `index.html` directly in a browser, **or** (recommended) serve the folder:

```bash
cd colby-choir
python3 -m http.server 8080
# → http://localhost:8080
```

Serving over HTTP is recommended so the audition form can POST to the email service.

## Where to edit what

| What | Where |
|---|---|
| All copy, stats, dates, marquee items | `js/content.js` (one object at the top) |
| Form fields / questions | `FIELD_DEFS` array at the top of `js/form.js` |
| Where applications are sent | `AUDITION_EMAIL` + `ACTION_URL` at the top of `js/form.js` |
| Images | `public/images/` (WebP, already resized/compressed) |
| Styles / colors / fonts | `css/styles.css` (CSS variables in `:root` at the top) |

## The audition form

- Fields are rendered from `FIELD_DEFS` — add/remove/reorder entries there and the form, validation, and submission follow.
- Parent/guardian fields appear automatically when age is under 18.
- **For now it emails `kaputgosling902@gmail.com`** via [formsubmit.co](https://formsubmit.co):
  - The **first** submission sends a one-time activation email to that address — click the link in it, and all future submissions arrive as formatted emails.
  - If the POST fails (e.g. opening `index.html` straight from disk), the form offers a pre-filled `mailto:` fallback.
- To switch providers later, find the marked line:
  `// TODO: connect form submission (Formspree / Google Forms / Supabase / etc.)`
  and replace the `fetch(ACTION_URL, …)` block with your provider's endpoint.

## The sound section

`index.html` → section `#sound`: paste your YouTube/Spotify/SoundCloud `<iframe>` inside `.player__frame`. There's an HTML comment marking the spot. Keep the aspect-ratio box so the layout doesn't jump.

## Images

- WebP files live in `public/images/` (hero capped at 2400px, others at 1200px).
- Originals were left untouched in your Downloads folder — nothing was moved.
- To swap a photo: replace the file with the same name, or update the `<img src>` + `alt` text in `index.html` and the `data-full` attribute on the gallery figure.

## Notes

- Mobile-first responsive; semantic HTML; lazy-loaded images below the fold; hero image preloaded; `font-display: swap` via Google Fonts.
- Motion (marquee, reveals, parallax) respects `prefers-reduced-motion`.
- Form is fully keyboard-accessible: real labels, visible focus states, `aria-live` error regions.
