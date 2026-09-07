/* ------------------------------------------------------------------
   TAVERNA TAKE OVER — Athens 40th
   This is the ONLY file you need to edit to take the site live.
   Replace every YOUR_… / XXXX placeholder. See README.md for how to
   get each value. Until then the site runs in a self-contained demo
   mode so you can review the design.
------------------------------------------------------------------ */

window.SITE_CONFIG = {
  // Cloudinary — powers the mandatory photo upload and the public gallery.
  // Needs an *unsigned* upload preset, and "Resource list" unrestricted.
  cloudinary: {
    cloudName: "YOUR_CLOUD_NAME",
    uploadPreset: "YOUR_UNSIGNED_PRESET",
    galleryTag: "athens40",
  },

  // Formspree — receives the RSVP. Just the ID from formspree.io/f/<ID>.
  formspree: {
    formId: "YOUR_FORM_ID",
  },

  // The host, for the WhatsApp quick-buttons.
  // Phone must be digits only, with country code and no leading + or 0.
  host: {
    name: "דור",
    whatsapp: "9725XXXXXXXX",
  },

  // Tavern music. A local file in assets/, or any direct audio URL.
  // autoplay: browsers usually block unmuted sound until a user gesture;
  // we try on load, then start on the first click, key, or scroll.
  music: {
    src: "assets/tavern-vibes.mp3",
    volume: 0.45,
    autoplay: true,
  },

  // Taverna dinner on Friday night — what the countdown counts down to.
  // Kept as a fixed +02:00 offset so it is correct from any timezone.
  eventStart: "2026-12-04T21:00:00+02:00",
};
