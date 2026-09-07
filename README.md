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

## It already works before you configure anything

Open the page right now and everything is clickable. The form validates,
"submits", fires the confetti, and your photo lands in the gallery — it
just stays in your own browser. A dark banner at the top lists whatever
is still a placeholder. Once you fill in `config.js` the banner
disappears and everything points at the real services.

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

## Setup checklist

Everything below is on a free tier and takes about ten minutes.

### 1. Cloudinary — photo uploads and the gallery

1. Sign up at [cloudinary.com](https://cloudinary.com). Your
   **Cloud name** is on the dashboard.
2. **Settings → Upload → Upload presets → Add upload preset.**
   - Set **Signing mode** to **Unsigned**. This is what lets guests
     upload straight from the browser with no server.
   - Under **Upload manipulations**, add the tag `athens40` so photos
     land in the gallery even if a request omits it.
   - Save, and copy the preset name.
3. **Settings → Security → Restricted media types** and clear the
   **Resource list** checkbox.

   This one is easy to miss and it is what makes the public gallery
   work: the site reads
   `https://res.cloudinary.com/<cloud>/image/list/athens40.json`
   directly from the browser. Leave it checked and photos still upload
   fine, but nobody sees the gallery — and the gallery says so.
4. Put the cloud name and preset name into `config.js`.

Two things worth knowing:

- That JSON is **cached by the CDN for about 60 seconds**, so a photo
  can take a minute to appear for other visitors. The uploader always
  sees their own photo immediately, because it is mirrored into
  `localStorage` and merged into the grid (marked "שלי").
- The list endpoint is **public and capped at 1000 images**. Fine for a
  birthday party; do not reuse the pattern for anything private.

Photos are downscaled to 1600px and re-encoded as JPEG in the browser
before upload, so a 6MB phone photo goes up as roughly 300KB.

### 2. Formspree — receiving the RSVPs

1. Sign up at [formspree.io](https://formspree.io) and create a form.
2. Copy the ID out of the endpoint `https://formspree.io/f/<ID>` into
   `formspree.formId`.

The free tier allows **50 submissions per month** and does **not**
support file uploads. That is fine here: the photo goes to Cloudinary
and Formspree only receives its URL as a text field.

Each submission arrives with `fullName`, `email`, `phone`, `guests`,
`euroleague`, `hotel`, `notes`, `photoUrl` and `photoId`. A hidden
honeypot named `_gotcha` filters out bots.

### 3. WhatsApp

Set `host.whatsapp` to digits only, with the country code and no leading
`+` or `0` — for example `972501234567`. Until then the WhatsApp buttons
are inert rather than broken.

### 4. Music (optional)

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
