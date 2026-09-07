/* ═══════════════════════════════════════════════════════════════════
   TAVERNA TAKE OVER — Athens 40th
   No dependencies. Everything degrades to a working demo when
   config.js still holds placeholders.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── config ────────────────────────────────────────────────────── */
  var CFG = window.SITE_CONFIG || {};
  var CLD = CFG.cloudinary || {};
  var HOST = CFG.host || {};
  var MUSIC = CFG.music || {};

  function filled(v) {
    return typeof v === "string" && v.trim() !== "" && !/^YOUR_/.test(v.trim()) && v.indexOf("XXXX") === -1;
  }

  var GF = CFG.googleForm || {};
  var GF_ENTRIES = GF.entries || {};
  var PHONE_DIGITS = String(HOST.phone || "").replace(/\D/g, "");
  var HAS_CLOUD = filled(CLD.cloudName) && filled(CLD.uploadPreset);
  var HAS_FORM = filled(GF.action) && filled(GF_ENTRIES.fullName);
  var HAS_PHONE = filled(HOST.phone) && /^\d{8,15}$/.test(PHONE_DIGITS);

  var GAL_TAG = CLD.galleryTag || "athens40";
  var LS_MINE = "athens40:mine";
  var LS_VOL = "athens40:vol";
  var SS_SETUP = "athens40:setupSeen";

  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── tiny helpers ──────────────────────────────────────────────── */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function pad(n) { return n < 10 ? "0" + n : String(n); }

  /* ═════════════════════════════════════════════════════════════════
     1. setup banner — tells you exactly what is still a placeholder
     ═════════════════════════════════════════════════════════════════ */
  (function setupBanner() {
    var missing = [];
    if (!HAS_CLOUD) missing.push("Cloudinary");
    if (!HAS_FORM) missing.push("Google Form");
    if (!HAS_PHONE) missing.push("טלפון");
    if (!missing.length) return;

    var banner = $("#setupBanner");
    if (!banner) return;
    $("#setupList").innerHTML =
      "עדיין חסר ב־<code>config.js</code>: " + missing.join(" · ") +
      ". עד אז אישורי ההגעה לא נשלחים לאף אחד, והתמונות נשמרות רק בדפדפן הזה.";

    try { if (sessionStorage.getItem(SS_SETUP)) return; } catch (e) { /* private mode */ }
    banner.hidden = false;
    $("#setupDismiss").addEventListener("click", function () {
      banner.hidden = true;
      try { sessionStorage.setItem(SS_SETUP, "1"); } catch (e) {}
    });
  })();

  /* ═════════════════════════════════════════════════════════════════
     2. tap-to-call links
     ═════════════════════════════════════════════════════════════════ */
  $$("[data-call]").forEach(function (el) {
    if (HAS_PHONE) {
      el.href = "tel:+" + PHONE_DIGITS;
    } else {
      el.removeAttribute("href");
      el.setAttribute("aria-disabled", "true");
      el.title = "הוסיפו מספר טלפון ב-config.js";
    }
  });

  /* ═════════════════════════════════════════════════════════════════
     3. reveal on scroll
     ═════════════════════════════════════════════════════════════════ */
  (function reveal() {
    var els = $$(".reveal");
    if (REDUCE || !("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -10% 0px" });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ═════════════════════════════════════════════════════════════════
     4. active nav link
     ═════════════════════════════════════════════════════════════════ */
  (function activeNav() {
    if (!("IntersectionObserver" in window)) return;
    var links = $$(".nav a");
    var map = {};
    var targets = [];
    links.forEach(function (a) {
      var el = document.getElementById(a.getAttribute("href").slice(1));
      if (!el) return;
      map[el.id] = a;
      targets.push(el);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-active"); });
        map[en.target.id].classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    targets.forEach(function (t) { io.observe(t); });
  })();

  /* ═════════════════════════════════════════════════════════════════
     4b. keep the floating player clear of the sticky top bar, which
         sits lower while the setup banner is on screen
     ═════════════════════════════════════════════════════════════════ */
  (function anchorPlayer() {
    var bar = $("#topbar");
    if (!bar) return;
    var queued = false;

    function measure() {
      queued = false;
      var bottom = Math.max(0, Math.round(bar.getBoundingClientRect().bottom));
      document.documentElement.style.setProperty("--bar-bottom", bottom + "px");
    }
    function schedule() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(measure);
    }

    measure();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    var banner = $("#setupBanner");
    if (banner) $("#setupDismiss").addEventListener("click", schedule);
  })();

  /* ═════════════════════════════════════════════════════════════════
     5. countdown to the taverna dinner (fixed Athens offset)
     ═════════════════════════════════════════════════════════════════ */
  (function countdown() {
    var sec = $("#countdown");
    var target = new Date(CFG.eventStart || "2026-12-04T21:00:00+02:00").getTime();
    if (!sec || isNaN(target)) return;

    var out = { d: $("#cd-d"), h: $("#cd-h"), m: $("#cd-m"), s: $("#cd-s") };
    var timer;

    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        sec.classList.add("is-live");
        $("#count-h").textContent = "יאסו! 40 לדור כבר כאן 🎉";
        $("#countNote").textContent = "נתראה באתונה";
        clearInterval(timer);
        return;
      }
      var t = Math.floor(diff / 1000);
      out.d.textContent = Math.floor(t / 86400);
      out.h.textContent = pad(Math.floor((t % 86400) / 3600));
      out.m.textContent = pad(Math.floor((t % 3600) / 60));
      out.s.textContent = pad(t % 60);
    }
    tick();
    timer = setInterval(tick, 1000);
  })();

  /* ═════════════════════════════════════════════════════════════════
     6. tavern music player — "Ouzo Mode"
     ═════════════════════════════════════════════════════════════════ */
  (function player() {
    var audio = $("#audio");
    var wrap = $("#player");
    var btn = $("#playBtn");
    var vol = $("#volume");
    var label = $(".player__label");
    if (!audio || !btn) return;

    function disable(note) {
      wrap.classList.add("is-off");
      btn.disabled = true;
      vol.disabled = true;
      label.textContent = note;
      label.removeAttribute("dir");
    }

    if (!filled(MUSIC.src)) {
      disable("אין קובץ מוזיקה");
      return;
    }
    audio.src = MUSIC.src;

    var saved = null;
    try { saved = localStorage.getItem(LS_VOL); } catch (e) {}
    var v = saved !== null ? Number(saved) : Math.round((typeof MUSIC.volume === "number" ? MUSIC.volume : 0.45) * 100);
    v = Math.max(0, Math.min(100, isNaN(v) ? 45 : v));
    vol.value = v;
    audio.volume = v / 100;

    vol.addEventListener("input", function () {
      audio.volume = vol.value / 100;
      try { localStorage.setItem(LS_VOL, vol.value); } catch (e) {}
    });

    function tryPlay() {
      var p = audio.play();
      if (p && p.catch) p.catch(function () {});
    }

    btn.addEventListener("click", function () {
      if (audio.paused) tryPlay();
      else audio.pause();
    });

    if (MUSIC.autoplay !== false) {
      tryPlay();
      var cap = { capture: true, passive: true };
      var unlock = function (e) {
        if (e && e.target && btn.contains(e.target)) return;
        tryPlay();
        document.removeEventListener("pointerdown", unlock, cap);
        document.removeEventListener("keydown", unlock, cap);
        window.removeEventListener("scroll", unlock, cap);
        window.removeEventListener("wheel", unlock, cap);
        window.removeEventListener("touchmove", unlock, cap);
      };
      document.addEventListener("pointerdown", unlock, cap);
      document.addEventListener("keydown", unlock, cap);
      window.addEventListener("scroll", unlock, cap);
      window.addEventListener("wheel", unlock, cap);
      window.addEventListener("touchmove", unlock, cap);
    }

    audio.addEventListener("play", function () { btn.setAttribute("aria-pressed", "true"); });
    audio.addEventListener("pause", function () { btn.setAttribute("aria-pressed", "false"); });
    audio.addEventListener("error", function () { disable("קובץ המוזיקה חסר"); });
  })();

  /* ═════════════════════════════════════════════════════════════════
     7. FAQ accordion — <details name> is native; this is the fallback
     ═════════════════════════════════════════════════════════════════ */
  (function accordion() {
    if ("name" in document.createElement("details")) return;
    var all = $$("#acc details");
    all.forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (!d.open) return;
        all.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  })();

  /* ═════════════════════════════════════════════════════════════════
     8. gallery — Cloudinary client-side resource list, no backend
     ═════════════════════════════════════════════════════════════════ */
  var galEl = $("#gal");
  var items = [];
  var remoteItems = [];
  var remoteFailed = false;

  function myPhotos() {
    try { return JSON.parse(localStorage.getItem(LS_MINE) || "[]"); } catch (e) { return []; }
  }

  function remember(item) {
    try {
      var all = myPhotos();
      all.unshift(item);
      var demos = 0, reals = 0, keep = [];
      all.forEach(function (it) {
        // demo entries carry a base64 payload, so cap them hard to stay
        // well inside the localStorage quota
        if (it.demo) { if (demos++ < 6) keep.push(it); }
        else if (reals++ < 60) keep.push(it);
      });
      localStorage.setItem(LS_MINE, JSON.stringify(keep));
    } catch (e) { /* quota exceeded — the remote list still has it */ }
  }

  function cldUrl(it, transform) {
    return "https://res.cloudinary.com/" + CLD.cloudName + "/image/upload/" + transform + "/" +
      (it.version ? "v" + it.version + "/" : "") + it.public_id + "." + (it.format || "jpg");
  }
  function thumbOf(it) {
    return it.demo ? it.src : cldUrl(it, "c_fill,g_auto,w_500,h_500,q_auto,f_auto");
  }
  function fullOf(it) {
    return it.demo ? it.src : cldUrl(it, "c_limit,w_1600,h_1600,q_auto,f_auto");
  }

  function galMessage(html) {
    galEl.removeAttribute("aria-busy");
    galEl.innerHTML = '<p class="gal__msg">' + html + "</p>";
  }

  function renderGallery() {
    if (!galEl) return;

    var seen = {};
    var list = [];
    myPhotos().forEach(function (it) {
      if (!it.public_id || seen[it.public_id]) return;
      seen[it.public_id] = 1;
      it._mine = true;
      list.push(it);
    });
    remoteItems.forEach(function (it) {
      if (!it.public_id || seen[it.public_id]) return;
      seen[it.public_id] = 1;
      list.push(it);
    });

    list.sort(function (a, b) {
      return String(b.created_at || "").localeCompare(String(a.created_at || ""));
    });
    items = list;

    if (!list.length) {
      if (remoteFailed) {
        galMessage("<b>הגלריה לא נטענה</b>ודאו שב־Cloudinary ביטלתם את ההגבלה על <code>Resource list</code>. עד אז התמונות עולות בסדר גמור, הן פשוט לא מוצגות כאן.");
      } else if (!HAS_CLOUD) {
        galMessage("<b>מצב הדגמה</b>תמונות שתעלו כאן יישמרו רק בדפדפן הזה. אחרי חיבור Cloudinary כולם יראו את כולן.");
      } else {
        galMessage("<b>עוד לא הועלו תמונות</b>היו הראשונים — התמונה שתוסיפו בטופס תופיע כאן.");
      }
      return;
    }

    galEl.removeAttribute("aria-busy");
    galEl.innerHTML = "";
    list.forEach(function (it, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "gal__item" + (it._mine ? " is-mine" : "");
      b.setAttribute("aria-label", "הגדלת תמונה " + (i + 1) + " מתוך " + list.length);

      var img = document.createElement("img");
      img.loading = "lazy";
      img.decoding = "async";
      img.alt = "תמונה מהעבר שהעלה אחד האורחים";
      img.src = thumbOf(it);

      b.appendChild(img);
      b.addEventListener("click", function () { openLb(i); });
      galEl.appendChild(b);
    });
  }

  function loadGallery() {
    if (!galEl) return;
    if (!HAS_CLOUD) { renderGallery(); return; }
    // The list JSON is CDN-cached for ~60s, which is why freshly uploaded
    // photos are also mirrored into localStorage and merged in above.
    fetch("https://res.cloudinary.com/" + CLD.cloudName + "/image/list/" + GAL_TAG + ".json", { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        remoteItems = (data && data.resources) || [];
        renderGallery();
      })
      .catch(function (err) {
        remoteFailed = true;
        console.warn("[gallery] could not read the Cloudinary resource list:", err.message);
        renderGallery();
      });
  }

  /* ── lightbox ──────────────────────────────────────────────────── */
  var lb = $("#lb"), lbImg = $("#lbImg"), lbCount = $("#lbCount");
  var lbPrev = $("#lbPrev"), lbNext = $("#lbNext");
  var lbIdx = 0, lastFocus = null;

  function paintLb() {
    var it = items[lbIdx];
    if (!it) return;
    lbImg.src = fullOf(it);
    lbImg.alt = "תמונה " + (lbIdx + 1) + " מתוך " + items.length;
    lbCount.textContent = items.length > 1 ? (lbIdx + 1) + " / " + items.length : "";
    lbPrev.hidden = lbNext.hidden = items.length < 2;
  }
  function openLb(i) {
    lbIdx = i;
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    paintLb();
    $("#lbClose").focus();
  }
  function closeLb() {
    lb.hidden = true;
    document.body.style.overflow = "";
    lbImg.removeAttribute("src");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function moveLb(step) {
    if (!items.length) return;
    lbIdx = (lbIdx + step + items.length) % items.length;
    paintLb();
  }
  if (lb) {
    $("#lbClose").addEventListener("click", closeLb);
    lbPrev.addEventListener("click", function () { moveLb(-1); });
    lbNext.addEventListener("click", function () { moveLb(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLb();
      // RTL: "previous" sits on the right, so the arrows are swapped
      else if (e.key === "ArrowRight") moveLb(-1);
      else if (e.key === "ArrowLeft") moveLb(1);
    });
  }

  loadGallery();

  /* ═════════════════════════════════════════════════════════════════
     9. mandatory photo upload
     ═════════════════════════════════════════════════════════════════ */
  var MAX_BYTES = 15 * 1024 * 1024;
  var MAX_DIM = 1600;

  var form = $("#rsvpForm");
  var fileInput = $("#photoInput");
  var drop = $("#drop");
  var shot = $("#shot");
  var preview = $("#photoPreview");
  var barFill = $("#barFill");
  var bar = $("#bar");
  var upStatus = $("#up-status");
  var photoUrl = $("#photoUrl");
  var photoId = $("#photoId");
  var uploadField = $("#upload");
  var submitBtn = $("#submitBtn");
  var submitTxt = $("#submitTxt");
  var SUBMIT_LABEL = submitTxt ? submitTxt.textContent : "";

  var uploading = false;
  var xhr = null;
  var previewUrl = null;

  function setProgress(pct) {
    barFill.style.width = pct + "%";
    bar.setAttribute("aria-valuenow", pct);
  }
  function upOk(msg) {
    shot.className = "shot is-ok";
    upStatus.textContent = msg;
  }
  function upFail(msg) {
    shot.className = "shot is-bad";
    upStatus.textContent = msg;
    photoUrl.value = "";
    photoId.value = "";
    uploading = false;
    lockSubmit(false);
  }
  function lockSubmit(on) {
    if (!submitBtn) return;
    submitBtn.disabled = on;
    submitTxt.textContent = on ? "רגע, מעלים את התמונה…" : SUBMIT_LABEL;
  }

  function showPreview(blob) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(blob);
    preview.classList.remove("is-broken");
    preview.src = previewUrl;
  }

  function resetPhoto() {
    if (xhr) { xhr.abort(); xhr = null; }
    uploading = false;
    lockSubmit(false);
    photoUrl.value = "";
    photoId.value = "";
    fileInput.value = "";
    setProgress(0);
    shot.hidden = true;
    shot.className = "shot";
    upStatus.textContent = "";
    drop.hidden = false;
    if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }
    preview.removeAttribute("src");
  }

  /* Downscale in the browser: mobile photos are 4–8MB and we only ever
     display them at 500px, so this makes uploads fast and keeps the
     Cloudinary free tier comfortable. */
  function shrink(file) {
    if (!("createImageBitmap" in window)) return Promise.resolve(file);
    var attempt = createImageBitmap(file, { imageOrientation: "from-image" })
      .catch(function () { return createImageBitmap(file); });

    return attempt.then(function (bmp) {
      var scale = Math.min(1, MAX_DIM / Math.max(bmp.width, bmp.height));
      var w = Math.max(1, Math.round(bmp.width * scale));
      var h = Math.max(1, Math.round(bmp.height * scale));
      var cv = document.createElement("canvas");
      cv.width = w; cv.height = h;
      cv.getContext("2d").drawImage(bmp, 0, 0, w, h);
      if (bmp.close) bmp.close();
      return new Promise(function (res) {
        cv.toBlob(function (blob) {
          if (!blob) return res(file);
          res(scale < 1 || blob.size < file.size ? blob : file);
        }, "image/jpeg", 0.82);
      });
    }).catch(function () {
      // HEIC on a non-Safari browser, or a codec we cannot decode.
      // Cloudinary converts it server-side, so send the original.
      return file;
    });
  }

  function uploadToCloud(blob, originalName) {
    uploading = true;
    lockSubmit(true);
    upStatus.textContent = "מעלים…";

    var base = String(originalName || "photo").replace(/\.[^.]+$/, "").slice(0, 60) || "photo";
    var ext = blob.type === "image/jpeg" ? "jpg" : (String(originalName || "").split(".").pop() || "jpg");

    var fd = new FormData();
    fd.append("file", blob, base + "." + ext);
    fd.append("upload_preset", CLD.uploadPreset);
    fd.append("tags", GAL_TAG);

    xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.cloudinary.com/v1_1/" + CLD.cloudName + "/image/upload");

    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 92));
    };
    xhr.onload = function () {
      xhr = null;
      uploading = false;
      lockSubmit(false);
      var res = {};
      try { res = JSON.parse(this.responseText); } catch (e) {}

      if (this.status >= 200 && this.status < 300 && res.secure_url) {
        setProgress(100);
        photoUrl.value = res.secure_url;
        photoId.value = res.public_id;
        clearErr(uploadField);
        upOk("התמונה עלתה בהצלחה 💙");
        remember({
          public_id: res.public_id,
          format: res.format,
          version: res.version,
          created_at: res.created_at || new Date().toISOString()
        });
        renderGallery();
      } else {
        var msg = "ההעלאה נכשלה";
        if (res.error && res.error.message) msg += " — " + res.error.message;
        upFail(msg + ". נסו שוב או בחרו תמונה אחרת.");
      }
    };
    xhr.onerror = function () {
      xhr = null;
      upFail("אין חיבור לשרת התמונות. בדקו את האינטרנט ונסו שוב.");
    };
    xhr.onabort = function () { xhr = null; };
    xhr.send(fd);
  }

  /* No Cloudinary yet: keep the photo in localStorage so the whole flow,
     including the gallery, is reviewable before any account exists. */
  function storeLocally(blob) {
    var fr = new FileReader();
    fr.onload = function () {
      var id = "demo-" + Date.now();
      photoUrl.value = "(demo) Cloudinary not configured";
      photoId.value = id;
      setProgress(100);
      clearErr(uploadField);
      upOk("נשמר מקומית — מצב הדגמה");
      remember({ demo: true, src: fr.result, public_id: id, created_at: new Date().toISOString() });
      renderGallery();
    };
    fr.onerror = function () { upFail("לא הצלחנו לקרוא את התמונה"); };
    fr.readAsDataURL(blob);
  }

  function handleFile(file) {
    if (!file) return;
    var looksLikeImage = /^image\//.test(file.type) || /\.(jpe?g|png|gif|webp|hei[cf]|avif)$/i.test(file.name);
    if (!looksLikeImage || file.size > MAX_BYTES) {
      drop.hidden = false;
      shot.hidden = true;
      // clear it so picking the very same file again still fires change
      fileInput.value = "";
      setErr(uploadField, looksLikeImage ? "התמונה גדולה מדי — עד 15MB" : "אפשר להעלות תמונות בלבד");
      return;
    }

    clearErr(uploadField);
    drop.hidden = true;
    shot.hidden = false;
    shot.className = "shot";
    photoUrl.value = "";
    photoId.value = "";
    setProgress(0);
    upStatus.textContent = "מכינים את התמונה…";

    // show the original straight away; downscaling is async and an <img>
    // with no src renders as a broken-image icon
    showPreview(file);

    shrink(file).then(function (blob) {
      if (blob !== file) showPreview(blob);
      if (HAS_CLOUD) uploadToCloud(blob, file.name);
      else storeLocally(blob);
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", function () { handleFile(this.files && this.files[0]); });
    // HEIC cannot be decoded outside Safari; the upload still works, so
    // fall back to a plain placeholder instead of a broken-image icon
    preview.addEventListener("error", function () { preview.classList.add("is-broken"); });
    $("#photoRemove").addEventListener("click", function () {
      resetPhoto();
      fileInput.click();
    });

    ["dragenter", "dragover"].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("is-over"); });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      drop.addEventListener(ev, function () { drop.classList.remove("is-over"); });
    });
    drop.addEventListener("drop", function (e) {
      e.preventDefault();
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) handleFile(f);
    });
  }

  /* ═════════════════════════════════════════════════════════════════
     10. validation + Google Form submit
     ═════════════════════════════════════════════════════════════════ */
  var MSG = {
    fullName: { valueMissing: "צריך שם פרטי ושם משפחה" },
    email: { valueMissing: "צריך כתובת אימייל", typeMismatch: "הכתובת לא נראית תקינה" },
    phone: { valueMissing: "צריך מספר טלפון", tooShort: "המספר קצר מדי" },
    guests: { valueMissing: "בחרו מספר אורחים" },
    euroleague: { valueMissing: "בחרו אחת מהאפשרויות" },
    hotel: { valueMissing: "בחרו אחת מהאפשרויות" }
  };
  var ORDER = ["valueMissing", "typeMismatch", "tooShort", "patternMismatch", "badInput"];

  function fieldOf(el) { return el.closest(".field"); }

  function setErr(field, msg) {
    if (!field) return;
    field.classList.add("has-err");
    var box = field.querySelector(".err");
    if (box) box.textContent = msg;
  }
  function clearErr(field) {
    if (!field) return;
    field.classList.remove("has-err");
  }

  function checkOne(el) {
    if (!el) return true;
    var field = fieldOf(el);
    if (el.checkValidity()) {
      clearErr(field);
      el.removeAttribute("aria-invalid");
      return true;
    }
    var map = MSG[el.name] || {};
    var msg = "שדה חובה";
    for (var i = 0; i < ORDER.length; i++) {
      if (el.validity[ORDER[i]]) { msg = map[ORDER[i]] || msg; break; }
    }
    setErr(field, msg);
    el.setAttribute("aria-invalid", "true");
    return false;
  }

  function controls() {
    if (!form) return [];
    var list = [];
    ["fullName", "email", "phone", "guests"].forEach(function (n) {
      if (form.elements[n]) list.push(form.elements[n]);
    });
    // a RadioNodeList has no .validity, but any member reflects the group
    ["euroleague", "hotel"].forEach(function (n) {
      var g = form.elements[n];
      if (g) list.push(g[0] || g);
    });
    return list;
  }

  function checkPhoto() {
    if (uploading) {
      setErr(uploadField, "רגע, התמונה עוד עולה…");
      return false;
    }
    if (!photoUrl.value) {
      setErr(uploadField, "חייבים תמונה שלנו מהעבר — זה חלק מהכיף 💙");
      return false;
    }
    clearErr(uploadField);
    return true;
  }

  function status(msg, bad) {
    var el = $("#formStatus");
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("is-bad", !!bad);
  }

  if (form) {
    // clear an error as soon as the guest fixes it
    ["input", "change"].forEach(function (ev) {
      form.addEventListener(ev, function (e) {
        var el = e.target;
        if (!el.name || !MSG[el.name]) return;
        var field = fieldOf(el);
        if (field && field.classList.contains("has-err")) checkOne(el);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status("");

      var firstBad = null;
      controls().forEach(function (el) {
        if (!checkOne(el) && !firstBad) firstBad = el;
      });
      var photoOk = checkPhoto();
      if (!photoOk && !firstBad) firstBad = uploadField;

      if (firstBad) {
        status("יש כמה שדות שצריך להשלים", true);
        var anchor = firstBad === uploadField ? uploadField : firstBad;
        anchor.scrollIntoView({ block: "center", behavior: REDUCE ? "auto" : "smooth" });
        if (firstBad !== uploadField && firstBad.focus) {
          setTimeout(function () { firstBad.focus({ preventScroll: true }); }, REDUCE ? 0 : 380);
        }
        return;
      }
      send();
    });
  }

  function send() {
    submitBtn.disabled = true;
    submitTxt.textContent = "שולחים…";
    status("");

    var payload = {};
    new FormData(form).forEach(function (v, k) {
      payload[k] = typeof v === "string" ? v : String(v);
    });

    function ok() { showDone(); }
    function bad(msg) {
      submitBtn.disabled = false;
      submitTxt.textContent = SUBMIT_LABEL;
      status(msg || "משהו נתקע. נסו שוב, או התקשרו אלינו.", true);
    }

    if (payload._gotcha) {
      setTimeout(ok, 400);
      return;
    }

    if (!HAS_FORM) {
      console.info("[demo] RSVP would be sent to Google Forms:", payload);
      setTimeout(ok, 900);
      return;
    }

    var fd = new FormData();
    Object.keys(GF_ENTRIES).forEach(function (name) {
      var entry = GF_ENTRIES[name];
      if (!filled(entry)) return;
      var val = payload[name];
      if (val == null) val = "";
      fd.append("entry." + String(entry).replace(/^entry\./, ""), val);
    });

    // Google does not send CORS headers. mode: 'no-cors' still delivers the
    // POST, then we treat it as success the same way a hidden-iframe submit would.
    fetch(GF.action, { method: "POST", mode: "no-cors", body: fd })
      .then(function () { ok(); })
      .catch(function () {
        bad("נראה שאין חיבור לאינטרנט. נסו שוב בעוד רגע.");
      });
  }

  function showDone() {
    var done = $("#done");
    form.hidden = true;
    done.hidden = false;
    done.scrollIntoView({ block: "center", behavior: REDUCE ? "auto" : "smooth" });
    confetti($("#confetti"));
  }

  /* ═════════════════════════════════════════════════════════════════
     11. confetti
     ═════════════════════════════════════════════════════════════════ */
  function confetti(canvas) {
    if (!canvas || REDUCE || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var box = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, box.width * dpr);
    canvas.height = Math.max(1, box.height * dpr);

    var colors = ["#D4AF37", "#F2D98B", "#00A6FB", "#6FD3FF", "#D6407F", "#6B7A4F", "#FAFAFA"];
    var bits = [];
    for (var i = 0; i < 90; i++) {
      bits.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height * 0.7,
        w: (4 + Math.random() * 6) * dpr,
        h: (7 + Math.random() * 10) * dpr,
        vx: (Math.random() - 0.5) * 1.4 * dpr,
        vy: (1.1 + Math.random() * 2.6) * dpr,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.2,
        c: colors[i % colors.length]
      });
    }

    var LIFE = 4600;
    var t0 = performance.now();
    function frame(now) {
      var age = now - t0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = age > LIFE - 1000 ? Math.max(0, (LIFE - age) / 1000) : 1;
      bits.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (p.y > canvas.height + 24) { p.y = -24; p.x = Math.random() * canvas.width; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (age < LIFE) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    requestAnimationFrame(frame);
  }

  /* ═════════════════════════════════════════════════════════════════
     12. sticky mobile CTA — steps aside once the form is on screen
     ═════════════════════════════════════════════════════════════════ */
  (function stickyCta() {
    var mcta = $("#mcta");
    var rsvp = $("#rsvp");
    if (!mcta || !rsvp || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { mcta.classList.toggle("is-hidden", en.isIntersecting); });
    }, { threshold: 0.2 }).observe(rsvp);
  })();

})();
