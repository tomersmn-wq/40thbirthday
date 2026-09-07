# TAVERNA TAKE OVER — חגיגת 40 באתונה

A mobile-first, Hebrew RTL single-page event and RSVP site for a 40th
birthday trip to Athens, December 4–6.

Plain HTML, CSS and vanilla JS. No build step, no dependencies, no
`node_modules`. Open `index.html` in a browser and it runs.

```
index.html    the whole page
styles.css    design system + every style
app.js        player, countdown, upload, form, gallery, lightbox
config.js     ← the only file you need to edit
assets/       optional music file and OG image
```

## Live services

RSVPs post to a Google Form (and a linked Sheet). Photos upload to
Cloudinary. Call links use the host number in `config.js`.

## Sending it to someone for review

```bash
node build-single.mjs
```

That inlines the CSS and JS into a single standalone
`taverna-athens-review.html` (~103KB) you can email or AirDrop. The
recipient just double-clicks it — no server, no folder, nothing to
install. It behaves exactly like the real site in demo mode, so they can
fill in the form, watch the confetti, and add a photo to the gallery
without anything being sent anywhere.

Fonts still load from Google Fonts, so an internet connection gives the
intended typography; offline it falls back to system serif and sans.

The file is generated and gitignored — rerun the command after any edit
rather than editing it by hand.

## Cloudinary gallery (one Console click)

Guest uploads already go to cloud `fgxnqd2s` with the unsigned preset
`athens40_unsigned`. The shared gallery reads
`https://res.cloudinary.com/fgxnqd2s/image/list/athens40.json`.

That list URL stays blocked until **Settings → Security → Restricted
media types → Resource list** is cleared in the Cloudinary Console
(after you claim the cloud). Uploads still work either way; only the
public grid needs that checkbox off.

The JSON is cached for about 60 seconds. The uploader sees their own
photo immediately via `localStorage` (marked "שלי"). Cap is 1000 images.

Photos are downscaled to 1600px JPEG in the browser before upload.

## Google Form RSVPs

Each submission lands on
[TAVERNA TAKE OVER — RSVP](https://docs.google.com/forms/d/107CER66e14gAUNG41F9bk__XNOi9DmxbwNj0wbg67dY/edit#responses)
and in the linked Sheet
[TAVERNA TAKE OVER — RSVP (Responses)](https://docs.google.com/spreadsheets/d/1QPKcI1wTEdy4OoKx2rtY3x3nMatgpPPrIIncZDTPom0/edit).

Fields: `fullName`, `email`, `phone`, `guests`, `euroleague`, `hotel`,
`notes`, `photoUrl`, `photoId`. A hidden honeypot `_gotcha` drops bots
without posting.

## Music (optional)

Drop a looping instrumental bouzouki `.mp3` at
`assets/tavern-vibes.mp3`, or point `music.src` at any direct audio URL.
See `assets/README.md`.

Every browser blocks audio autoplay, so the player starts paused with a
gentle pulse on the button inviting a tap. If the file is missing the
player quietly disables itself instead of erroring.

## Deploy to Vercel

There is nothing to build, so no framework preset and no build command.

```bash
git init
git add .
git commit -m "TAVERNA TAKE OVER"
git remote add origin <your-repo-url>
git push -u origin main
```

Then import the repo at [vercel.com/new](https://vercel.com/new). Leave
the framework as **Other** and the build and output settings empty —
Vercel serves the files as they are.

To edit copy or dates later, push to the branch and Vercel redeploys.

## Editing the content

- **Schedule** — the `<ol class="timeline">` block in `index.html`. Each
  day is one `<li class="tl-item">`; each row inside is one `<li>` with a
  `<span class="time">`.
- **FAQ** — the `<details>` elements inside `<div class="acc">`.
- **Countdown target** — `eventStart` in `config.js`. It carries a fixed
  `+02:00` Athens offset so it reads correctly from any timezone.
- **Colours and fonts** — the `:root` block at the top of `styles.css`.

## Notes on the Hebrew and RTL

The page is `<html lang="he" dir="rtl">` and the CSS uses logical
properties (`margin-inline`, `inset-inline-start`, `border-inline-start`)
rather than left/right, so the layout mirrors itself with no overrides.

Latin and numeric runs like `DECEMBER 4–6` and `20:15` are wrapped in
`<span dir="ltr">` with `unicode-bidi: isolate`, otherwise the bidi
algorithm reorders their dashes and colons. Keep that wrapper if you edit
those strings.

Headings use three fonts on purpose: **Cinzel** has no Hebrew glyphs, so
it only ever carries Latin display text. Hebrew headings use **Frank Ruhl
Libre**, and body text uses **Heebo**.
