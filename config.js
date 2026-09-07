/* ------------------------------------------------------------------
   TAVERNA TAKE OVER — Athens 40th
   Live config: Cloudinary unsigned uploads, Google Form RSVPs,
   and the host phone for tap-to-call.
------------------------------------------------------------------ */

window.SITE_CONFIG = {
  // Cloudinary — powers the mandatory photo upload and the public gallery.
  // Needs an *unsigned* upload preset, and "Resource list" unrestricted.
  cloudinary: {
    cloudName: "fgxnqd2s",
    uploadPreset: "athens40_unsigned",
    galleryTag: "athens40",
  },

  // Google Form — RSVPs land in Form responses (and the linked Sheet).
  // action is the formResponse URL; entries map our field names to entry.IDs.
  googleForm: {
    action: "https://docs.google.com/forms/d/e/1FAIpQLSdrUNM17ngTRTVZXyDGgSkQV86nk7vfmZaJJIzyZVW2WOO-sA/formResponse",
    entries: {
      fullName: "1357340627",
      email: "9817593",
      phone: "943205956",
      guests: "2094572825",
      euroleague: "1921205365",
      hotel: "706770546",
      notes: "1443597264",
      photoUrl: "1086197650",
      photoId: "1382549608",
    },
  },

  // Host contact. Phone is shown as a tap-to-call number, digits with country code.
  host: {
    name: "דור נצר",
    phone: "+972 50-547-7110",
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
