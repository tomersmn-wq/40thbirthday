# assets

Two optional files go here. The site works without both of them.

## `tavern-vibes.mp3`

The looping bouzouki track for the "Ouzo Mode" player. Drop any `.mp3`
here with exactly that name and the player picks it up automatically.

Pick something instrumental and seamless — it loops forever. Good
sources for royalty-free Greek/bouzouki tracks: Pixabay Music,
Free Music Archive, YouTube Audio Library.

Prefer streaming instead of committing a file? Put the direct audio URL
in `music.src` in `config.js`. Note that SoundCloud and Spotify *page*
links will not work — the player needs a direct file URL.

If the file is missing the player disables itself with a quiet note
rather than erroring.

## `og.jpg`

Optional 1200x630 preview image for iMessage and other link previews.
If you add it, uncomment the two `og:image` / `twitter:image` tags in the
`<head>` of `index.html`.
