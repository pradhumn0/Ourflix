/* ============================================================
   OURFLIX — APP LOGIC
   Everything here reads from CONFIG / VIDEOS / PHOTOS / REELS /
   LETTERS defined in config.js. You should never need to edit
   this file to personalize the site — only config.js.
   ============================================================ */

(() => {
  "use strict";

  /* ---------------------------------------------------------
     Small helpers
  --------------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  function toast(msg, ms = 2200) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), ms);
  }

  /* ---------------------------------------------------------
     Google Drive link → direct-usable URL
     Supports:
       https://drive.google.com/file/d/FILE_ID/view?usp=sharing
       https://drive.google.com/open?id=FILE_ID
  --------------------------------------------------------- */
  function driveFileId(url) {
    if (!url) return null;
    let m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (m) return m[1];
    m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m) return m[1];
    return null;
  }
  function toDriveImage(url) {
    if (!url) return "";
    const id = driveFileId(url);
    if (!id) return url; // assume it's already a direct URL (e.g. from another host)
    return `https://drive.google.com/uc?export=view&id=${id}`;
  }
  function toDriveVideo(url) {
    if (!url) return "";
    const id = driveFileId(url);
    if (!id) return url;
    return `https://drive.google.com/uc?export=download&id=${id}`;
  }

  /* ---------------------------------------------------------
     LocalStorage — favorites, continue watching, reel likes, music pref
  --------------------------------------------------------- */
  const LS = {
    favorites: "ourflix_favorites",
    progress: "ourflix_progress",
    reelLikes: "ourflix_reel_likes",
    music: "ourflix_music_pref",
  };
  const readJSON = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  };
  const writeJSON = (key, val) => localStorage.setItem(key, JSON.stringify(val));

  function getFavorites() { return readJSON(LS.favorites, []); }
  function isFavorite(title) { return getFavorites().includes(title); }
  function toggleFavorite(title) {
    const favs = getFavorites();
    const i = favs.indexOf(title);
    if (i === -1) { favs.push(title); toast("Added to My List ❤"); }
    else { favs.splice(i, 1); toast("Removed from My List"); }
    writeJSON(LS.favorites, favs);
    return favs.includes(title);
  }

  function getProgress() { return readJSON(LS.progress, {}); }
  function setProgress(title, time, duration) {
    const p = getProgress();
    p[title] = { time, duration, updated: Date.now() };
    writeJSON(LS.progress, p);
  }
  function getProgressFor(title) { return getProgress()[title]; }

  function getReelLikes() { return readJSON(LS.reelLikes, []); }
  function isReelLiked(title) { return getReelLikes().includes(title); }
  function toggleReelLike(title) {
    const likes = getReelLikes();
    const i = likes.indexOf(title);
    if (i === -1) likes.push(title); else likes.splice(i, 1);
    writeJSON(LS.reelLikes, likes);
    return likes.includes(title);
  }

  /* ===========================================================
     1. INTRO LOADER → 2. PROFILES → 3. LOGIN → 4. APP
  =========================================================== */
  function init() {
    applyProfileConfig();
    setTimeout(showProfiles, 2900);
    wireProfiles();
    wireLogin();
    wireApp();
    listenForKonami();
  }

  function applyProfileConfig() {
    $("#name-her").textContent = CONFIG.girlfriendName || "Her";
    $("#name-me").textContent = CONFIG.myName || "Me";
    if (CONFIG.girlfriendProfilePhoto) {
      $("#avatar-her").innerHTML = `<img src="${toDriveImage(CONFIG.girlfriendProfilePhoto)}" alt="">`;
    }
    if (CONFIG.myProfilePhoto) {
      $("#avatar-me").innerHTML = `<img src="${toDriveImage(CONFIG.myProfilePhoto)}" alt="">`;
    }
  }

  function showProfiles() {
    $("#screen-loader").classList.add("hidden");
    $("#screen-profiles").classList.remove("hidden");
  }

  let selectedProfile = "her";
  function wireProfiles() {
    $$(".profile-card[data-profile]").forEach(card => {
      on(card, "click", () => {
        selectedProfile = card.dataset.profile;
        card.classList.add("selecting");
        setTimeout(() => {
          $("#screen-profiles").classList.add("hidden");
          $("#screen-login").classList.remove("hidden");
          $("#input-username").focus();
        }, 380);
      });
    });
  }

  function wireLogin() {
    const form = $("#login-form");
    on(form, "submit", (e) => {
      e.preventDefault();
      const u = $("#input-username").value.trim();
      const p = $("#input-password").value;
      if (u === CONFIG.username && p === CONFIG.password) {
        $("#login-error").classList.remove("show");
        $("#screen-login").classList.add("hidden");
        $("#screen-app").classList.remove("hidden");
        startApp();
      } else {
        $("#login-error").classList.add("show");
        ["field-username", "field-password"].forEach(id => {
          const f = document.getElementById(id);
          f.classList.remove("shake"); void f.offsetWidth; f.classList.add("shake");
        });
      }
    });
    // button ripple
    on($("#login-submit"), "click", createRipple);
  }

  function createRipple(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const r = document.createElement("span");
    r.className = "ripple";
    r.style.left = (e.clientX - rect.left) + "px";
    r.style.top = (e.clientY - rect.top) + "px";
    btn.appendChild(r);
    setTimeout(() => r.remove(), 650);
  }

  let appStarted = false;
  function startApp() {
    if (appStarted) return;
    appStarted = true;
    const isHer = selectedProfile === "her";
    $("#nav-avatar").innerHTML = isHer
      ? ($("#avatar-her").innerHTML || "❤️")
      : ($("#avatar-me").innerHTML || "🖤");

    renderHero();
    renderQuote();
    renderHomeRows();
    renderMoviesPage();
    renderMemoriesPage();
    renderGallery();
    renderLetters();
    renderReels();
    setupMusic();
  }

  /* ===========================================================
     NAVIGATION
  =========================================================== */
  function wireApp() {
    on($("#navbar"), "click", () => {}); // placeholder
    on($("#app-scroll"), "scroll", () => {
      $("#navbar").classList.toggle("scrolled", $("#app-scroll").scrollTop > 10);
    });

    $$('[data-page]').forEach(link => {
      on(link, "click", (e) => {
        e.preventDefault();
        showPage(link.dataset.page);
        $("#mobile-nav").classList.remove("open");
      });
    });

    on($("#mobile-menu-btn"), "click", () => $("#mobile-nav").classList.toggle("open"));

    // search
    on($("#nav-search-btn"), "click", () => {
      $("#nav-search-wrap").classList.toggle("open");
      if ($("#nav-search-wrap").classList.contains("open")) $("#nav-search-input").focus();
    });
    on($("#nav-search-input"), "input", (e) => runSearch(e.target.value));
    on($("#nav-search-input"), "keydown", (e) => { if (e.key === "Enter") showPage("search"); });

    // hero actions
    on($("#hero-play"), "click", () => {
      const first = VIDEOS[0];
      if (first) openPlayer(first);
    });
    on($("#hero-list"), "click", () => {
      const first = VIDEOS[0];
      if (!first) return;
      const active = toggleFavorite(first.title);
      $("#hero-list").classList.toggle("active", active);
    });

    // player
    on($("#player-close"), "click", closePlayer);
    on($("#player-overlay"), "click", (e) => { if (e.target.id === "player-overlay") closePlayer(); });
    wirePlayerControls();

    // gallery lightbox
    on($("#lightbox-close"), "click", closeLightbox);
    on($("#lightbox-prev"), "click", () => navLightbox(-1));
    on($("#lightbox-next"), "click", () => navLightbox(1));
    on($("#lightbox"), "click", (e) => { if (e.target.id === "lightbox") closeLightbox(); });
    on($("#lightbox-img"), "contextmenu", (e) => e.preventDefault());

    // letters
    on($("#env-close"), "click", closeEnvelope);
    on($("#envelope-overlay"), "click", (e) => { if (e.target.id === "envelope-overlay") closeEnvelope(); });

    // music
    on($("#music-toggle"), "click", toggleMusic);

    // egg
    on($("#egg-close"), "click", () => $("#egg-overlay").classList.remove("open"));

    // global keyboard
    on(document, "keydown", handleGlobalKeys);

    // swipe for lightbox
    setupLightboxSwipe();
  }

  function showPage(id) {
    $$(".page").forEach(p => p.classList.remove("active"));
    const target = $("#page-" + id);
    if (target) target.classList.add("active");
    $$('[data-page]').forEach(l => l.classList.toggle("active", l.dataset.page === id));
    $("#app-scroll").scrollTop = 0;
    if (id === "reels") {
      // pause everything else, let reel observer take over
    } else {
      pauseAllReels();
    }
    if (id === "mylist") renderMyList();
  }

  function handleGlobalKeys(e) {
    if ($("#player-overlay").classList.contains("open")) {
      if (e.key === "Escape") closePlayer();
      if (e.key === " ") { e.preventDefault(); togglePlayPause(); }
      if (e.key === "ArrowRight") seekBy(5);
      if (e.key === "ArrowLeft") seekBy(-5);
      if (e.key.toLowerCase() === "f") toggleFullscreen();
      if (e.key.toLowerCase() === "m") toggleMute();
    }
    if (e.key === "Escape") {
      closeLightbox();
      closeEnvelope();
    }
    if ($("#lightbox").classList.contains("open")) {
      if (e.key === "ArrowRight") navLightbox(1);
      if (e.key === "ArrowLeft") navLightbox(-1);
    }
  }

  /* ===========================================================
     HERO
  =========================================================== */
  function renderHero() {
    const h = CONFIG.hero || {};
    $("#hero-title").textContent = h.title || "Us.";
    $("#hero-desc").textContent = h.description || "";
    const media = $("#hero-media");
    if (h.backgroundVideo) {
      media.innerHTML = `<video autoplay muted loop playsinline src="${toDriveVideo(h.backgroundVideo)}"></video>`;
    } else if (h.backgroundImage) {
      media.innerHTML = `<img src="${toDriveImage(h.backgroundImage)}" alt="">`;
    }
    const first = VIDEOS[0];
    if (first && isFavorite(first.title)) $("#hero-list").classList.add("active");
  }

  function renderQuote() {
    const quotes = CONFIG.dailyQuotes && CONFIG.dailyQuotes.length ? CONFIG.dailyQuotes : ["You are my favorite person."];
    const dayIndex = Math.floor(Date.now() / 86400000) % quotes.length;
    $("#quote-text").textContent = quotes[dayIndex];
  }

  /* ===========================================================
     ROWS / CARDS
  =========================================================== */
  function groupByCategory(list) {
    const map = new Map();
    list.forEach(v => {
      const cat = v.category || "More";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(v);
    });
    return map;
  }

  function createCard(video) {
    const card = document.createElement("div");
    card.className = "card";
    card.tabIndex = 0;
    const prog = getProgressFor(video.title);
    const pct = prog && prog.duration ? Math.min(100, (prog.time / prog.duration) * 100) : 0;
    const fav = isFavorite(video.title);
    card.innerHTML = `
      <div class="card-thumb">
        ${video.poster ? `<img loading="lazy" src="${toDriveImage(video.poster)}" alt="">` : `<span class="placeholder-icon">🎬</span>`}
        <button class="card-fav ${fav ? "active" : ""}" aria-label="Toggle favorite">❤</button>
        ${pct > 0 ? `<div class="card-progress"><span style="width:${pct}%"></span></div>` : ""}
      </div>
      <div class="card-body">
        <h4 class="card-title">${video.title}</h4>
        <div class="card-meta"><span>${video.year || ""}</span><span>${video.duration || ""}</span></div>
        <div class="card-desc">${video.description || ""}</div>
      </div>`;
    on(card, "click", (e) => {
      if (e.target.closest(".card-fav")) return;
      openPlayer(video);
    });
    on(card, "keydown", (e) => { if (e.key === "Enter") openPlayer(video); });
    on(card.querySelector(".card-fav"), "click", (e) => {
      e.stopPropagation();
      const active = toggleFavorite(video.title);
      e.currentTarget.classList.toggle("active", active);
    });
    return card;
  }

  function buildRow(title, videos) {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<h3 class="row-title">${title}</h3>
      <div class="row-track-wrap">
        <button class="row-nav left" aria-label="Scroll left">‹</button>
        <div class="row-track"></div>
        <button class="row-nav right" aria-label="Scroll right">›</button>
      </div>`;
    const track = row.querySelector(".row-track");
    videos.forEach(v => track.appendChild(createCard(v)));
    row.querySelector(".row-nav.left").addEventListener("click", () => track.scrollBy({ left: -400, behavior: "smooth" }));
    row.querySelector(".row-nav.right").addEventListener("click", () => track.scrollBy({ left: 400, behavior: "smooth" }));
    return row;
  }

  function renderRowsInto(container, videos, { includeContinue = false } = {}) {
    container.innerHTML = "";
    if (!videos.length) {
      container.innerHTML = `<p class="row-empty">Add entries to the VIDEOS array in config.js to fill this page with your memories.</p>`;
      return;
    }
    if (includeContinue) {
      const progress = getProgress();
      const continueList = Object.keys(progress)
        .filter(title => progress[title].duration && progress[title].time > 3 && progress[title].time < progress[title].duration - 5)
        .sort((a, b) => progress[b].updated - progress[a].updated)
        .map(title => videos.find(v => v.title === title))
        .filter(Boolean);
      if (continueList.length) container.appendChild(buildRow("Continue Watching", continueList));
    }
    groupByCategory(videos).forEach((vids, cat) => container.appendChild(buildRow(cat, vids)));
  }

  function renderHomeRows() { renderRowsInto($("#home-rows"), VIDEOS, { includeContinue: true }); }
  function renderMoviesPage() { renderRowsInto($("#movies-rows"), VIDEOS); }
  function renderMemoriesPage() { renderRowsInto($("#memories-rows"), VIDEOS); }

  function renderMyList() {
    const favs = getFavorites();
    const vids = VIDEOS.filter(v => favs.includes(v.title));
    const grid = $("#mylist-grid");
    grid.innerHTML = "";
    if (!vids.length) {
      grid.innerHTML = `<p class="row-empty">Nothing here yet — tap the heart on any memory to add it to My List.</p>`;
      return;
    }
    vids.forEach(v => grid.appendChild(createCard(v)));
  }

  /* ===========================================================
     PLAYER
  =========================================================== */
  let currentVideo = null;
  const videoEl = () => $("#player-video");

  function openPlayer(video) {
    currentVideo = video;
    $("#player-title").textContent = video.title;
    $("#player-desc").textContent = video.description || "";
    const src = toDriveVideo(video.video);
    const el = videoEl();
    if (src) {
      $("#player-noSrc").style.display = "none";
      el.style.display = "block";
      el.src = src;
      const prog = getProgressFor(video.title);
      if (prog && prog.time && prog.duration && prog.time < prog.duration - 5) {
        el.currentTime = prog.time;
      }
      el.play().catch(() => {});
    } else {
      $("#player-noSrc").style.display = "flex";
      el.style.display = "none";
      el.removeAttribute("src");
    }
    $("#player-overlay").classList.add("open");
  }

  function closePlayer() {
    const el = videoEl();
    if (currentVideo && el.duration) setProgress(currentVideo.title, el.currentTime, el.duration);
    el.pause();
    $("#player-overlay").classList.remove("open");
    renderHomeRows(); // refresh progress bars
  }

  function togglePlayPause() {
    const el = videoEl();
    if (el.paused) el.play(); else el.pause();
  }
  function seekBy(sec) { const el = videoEl(); el.currentTime = Math.max(0, el.currentTime + sec); }
  function toggleMute() { const el = videoEl(); el.muted = !el.muted; $("#ctrl-mute").textContent = el.muted ? "🔇" : "🔊"; }
  function toggleFullscreen() {
    const wrap = $("#player-video-wrap");
    if (!document.fullscreenElement) wrap.requestFullscreen?.();
    else document.exitFullscreen?.();
  }
  function fmtTime(t) {
    if (!isFinite(t)) return "0:00";
    const m = Math.floor(t / 60), s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function wirePlayerControls() {
    const el = videoEl();
    on($("#ctrl-playpause"), "click", togglePlayPause);
    on(el, "play", () => { $("#ctrl-playpause").textContent = "⏸"; $("#player-video-wrap").classList.remove("paused"); });
    on(el, "pause", () => { $("#ctrl-playpause").textContent = "▶"; $("#player-video-wrap").classList.add("paused"); });
    on(el, "timeupdate", () => {
      if (el.duration) {
        $("#seek-bar").value = (el.currentTime / el.duration) * 100;
        $("#ctrl-time").textContent = `${fmtTime(el.currentTime)} / ${fmtTime(el.duration)}`;
        if (currentVideo) setProgress(currentVideo.title, el.currentTime, el.duration);
      }
    });
    on($("#seek-bar"), "input", (e) => { if (el.duration) el.currentTime = (e.target.value / 100) * el.duration; });
    on($("#ctrl-mute"), "click", toggleMute);
    on($("#vol-slider"), "input", (e) => { el.volume = e.target.value; el.muted = false; $("#ctrl-mute").textContent = "🔊"; });
    on($("#ctrl-speed"), "change", (e) => { el.playbackRate = parseFloat(e.target.value); });
    on($("#ctrl-fullscreen"), "click", toggleFullscreen);
    on($("#ctrl-pip"), "click", async () => {
      try {
        if (document.pictureInPictureElement) await document.exitPictureInPicture();
        else await el.requestPictureInPicture();
      } catch { toast("Picture-in-picture isn't available for this video."); }
    });
    on(el, "ended", playNextInCategory);
  }

  function playNextInCategory() {
    if (!currentVideo) return;
    const cat = currentVideo.category || "More";
    const list = VIDEOS.filter(v => (v.category || "More") === cat);
    const idx = list.findIndex(v => v.title === currentVideo.title);
    const next = list[idx + 1];
    if (next) {
      toast(`Playing next: ${next.title}`);
      setTimeout(() => openPlayer(next), 900);
    }
  }

  /* ===========================================================
     GALLERY + LIGHTBOX
  =========================================================== */
  function renderGallery() {
    const grid = $("#gallery-grid");
    grid.innerHTML = "";
    if (!PHOTOS.length) {
      grid.innerHTML = `<p class="row-empty">Add entries to the PHOTOS array in config.js to fill your gallery.</p>`;
      return;
    }
    PHOTOS.forEach((p, i) => {
      const item = document.createElement("div");
      item.className = "masonry-item";
      item.innerHTML = p.image
        ? `<img loading="lazy" src="${toDriveImage(p.image)}" alt="${p.title || ""}" oncontextmenu="return false">`
        : `<div class="ph">🖼️</div>`;
      item.innerHTML += `<div class="cap">${p.title || ""}</div>`;
      on(item, "click", () => openLightbox(i));
      grid.appendChild(item);
    });
  }

  let lbIndex = 0;
  function openLightbox(i) {
    lbIndex = i;
    updateLightbox();
    $("#lightbox").classList.add("open");
  }
  function updateLightbox() {
    const p = PHOTOS[lbIndex];
    $("#lightbox-img").src = p.image ? toDriveImage(p.image) : "";
    $("#lightbox-img").alt = p.title || "";
    $("#lightbox-img").style.transform = "scale(1)";
  }
  function closeLightbox() { $("#lightbox").classList.remove("open"); }
  function navLightbox(dir) {
    lbIndex = (lbIndex + dir + PHOTOS.length) % PHOTOS.length;
    updateLightbox();
  }
  function setupLightboxSwipe() {
    let startX = 0, zoomed = false;
    const img = $("#lightbox-img");
    on(img, "touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    on(img, "touchend", (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 60) navLightbox(dx > 0 ? -1 : 1);
    }, { passive: true });
    on(img, "click", () => {
      zoomed = !zoomed;
      img.style.transform = zoomed ? "scale(1.6)" : "scale(1)";
    });
  }

  /* ===========================================================
     LOVE LETTERS
  =========================================================== */
  function renderLetters() {
    const grid = $("#letters-grid");
    grid.innerHTML = "";
    if (!LETTERS.length) {
      grid.innerHTML = `<p class="row-empty">Add entries to the LETTERS array in config.js to write your letters.</p>`;
      return;
    }
    LETTERS.forEach((letter, i) => {
      const card = document.createElement("div");
      card.className = "letter-card";
      card.innerHTML = `<div class="seal">✉</div><h4>${letter.title}</h4><p>${letter.date || ""}</p>`;
      on(card, "click", () => openEnvelope(letter));
      grid.appendChild(card);
    });
  }

  function openEnvelope(letter) {
    $("#env-title").textContent = letter.title;
    $("#env-date").textContent = letter.date || "";
    $("#env-body").textContent = letter.body || "";
    $("#envelope").classList.remove("unfolded");
    $("#envelope-overlay").classList.add("open");
    setTimeout(() => $("#envelope").classList.add("unfolded"), 350);
  }
  function closeEnvelope() {
    $("#envelope-overlay").classList.remove("open");
    $("#envelope").classList.remove("unfolded");
  }

  /* ===========================================================
     REELS
  =========================================================== */
  let reelsBuilt = false;
  function renderReels() {
    const wrap = $("#reels-wrap");
    wrap.innerHTML = "";
    if (!REELS.length) {
      wrap.innerHTML = `<p class="row-empty" style="padding-top:100px;">Add entries to the REELS array in config.js to fill this page.</p>`;
      return;
    }
    REELS.forEach((reel) => {
      const el = document.createElement("div");
      el.className = "reel";
      const src = toDriveVideo(reel.video);
      const liked = isReelLiked(reel.title);
      el.innerHTML = `
        <div class="reel-progress"><span></span></div>
        ${src ? `<video src="${src}" loop playsinline muted></video>` : `<div class="reel-noSrc">🎥<div>Add a video link in config.js</div></div>`}
        <div class="reel-scrim"></div>
        <div class="reel-info"><h3>${reel.title}</h3><p>${reel.caption || ""}</p></div>
        <div class="reel-actions">
          <button class="heart-btn ${liked ? "liked" : ""}" aria-label="Like">❤<span>Like</span></button>
          <button aria-label="Comment">💬<span>Us</span></button>
          <button aria-label="Share">↗<span>Share</span></button>
        </div>
        <div class="reel-hint">Swipe up for the next one</div>`;
      const video = el.querySelector("video");
      const heartBtn = el.querySelector(".heart-btn");
      on(heartBtn, "click", () => {
        const active = toggleReelLike(reel.title);
        heartBtn.classList.toggle("liked", active);
      });
      on(el.querySelectorAll(".reel-actions button")[1], "click", () => toast("Only the two of us can comment here 💛"));
      on(el.querySelectorAll(".reel-actions button")[2], "click", () => toast("This one's just for us — no sharing needed 💛"));
      if (video) {
        on(el, "dblclick", () => {
          if (!isReelLiked(reel.title)) { toggleReelLike(reel.title); heartBtn.classList.add("liked"); }
          spawnFloatingHeart(el);
        });
        on(video, "timeupdate", () => {
          if (video.duration) el.querySelector(".reel-progress span").style.width = (video.currentTime / video.duration) * 100 + "%";
        });
        on(el, "click", (e) => { if (!e.target.closest("button")) { video.paused ? video.play() : video.pause(); } });
      }
      wrap.appendChild(el);
    });
    if (!reelsBuilt) { setupReelsObserver(); reelsBuilt = true; }
  }

  function spawnFloatingHeart(container) {
    const h = document.createElement("div");
    h.className = "floating-heart";
    h.textContent = "❤";
    h.style.left = 45 + Math.random() * 10 + "%";
    h.style.bottom = "120px";
    container.appendChild(h);
    setTimeout(() => h.remove(), 1100);
  }

  function setupReelsObserver() {
    const wrap = $("#reels-wrap");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target.querySelector("video");
        if (!video) return;
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      });
    }, { root: wrap, threshold: 0.7 });
    const observe = () => $$(".reel", wrap).forEach(r => io.observe(r));
    observe();
    // re-observe if reels re-rendered
    reelsObserverRefresh = observe;
  }
  let reelsObserverRefresh = () => {};

  function pauseAllReels() {
    $$("#reels-wrap video").forEach(v => v.pause());
  }

  /* ===========================================================
     SEARCH
  =========================================================== */
  function runSearch(query) {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return;
    renderSearchResults(q);
  }

  function renderSearchResults(q) {
    const vids = VIDEOS.filter(v => (v.title + v.description + v.category).toLowerCase().includes(q));
    const photos = PHOTOS.filter(p => (p.title + (p.category || "")).toLowerCase().includes(q));
    const letters = LETTERS.filter(l => (l.title + l.body).toLowerCase().includes(q));
    $("#search-summary").textContent = `Results for "${q}"`;
    const container = $("#search-results");
    container.innerHTML = "";
    if (!vids.length && !photos.length && !letters.length) {
      container.innerHTML = `<div class="no-results">No memories found for "${q}".</div>`;
      showPage("search");
      return;
    }
    if (vids.length) {
      const sec = document.createElement("div"); sec.className = "search-section";
      sec.innerHTML = `<h3>Videos</h3><div class="search-grid"></div>`;
      const g = sec.querySelector(".search-grid");
      vids.forEach(v => g.appendChild(createCard(v)));
      container.appendChild(sec);
    }
    if (photos.length) {
      const sec = document.createElement("div"); sec.className = "search-section";
      sec.innerHTML = `<h3>Photos</h3><div class="masonry" style="padding:10px 0 0;"></div>`;
      const g = sec.querySelector(".masonry");
      photos.forEach(p => {
        const idx = PHOTOS.indexOf(p);
        const item = document.createElement("div");
        item.className = "masonry-item";
        item.innerHTML = (p.image ? `<img src="${toDriveImage(p.image)}" alt="">` : `<div class="ph">🖼️</div>`) + `<div class="cap">${p.title || ""}</div>`;
        on(item, "click", () => openLightbox(idx));
        g.appendChild(item);
      });
      container.appendChild(sec);
    }
    if (letters.length) {
      const sec = document.createElement("div"); sec.className = "search-section";
      sec.innerHTML = `<h3>Love Letters</h3><div class="letters-grid" style="padding-top:10px;"></div>`;
      const g = sec.querySelector(".letters-grid");
      letters.forEach(l => {
        const card = document.createElement("div");
        card.className = "letter-card";
        card.innerHTML = `<div class="seal">✉</div><h4>${l.title}</h4><p>${l.date || ""}</p>`;
        on(card, "click", () => openEnvelope(l));
        g.appendChild(card);
      });
      container.appendChild(sec);
    }
    showPage("search");
  }

  /* ===========================================================
     BACKGROUND MUSIC
  =========================================================== */
  function setupMusic() {
    const audio = $("#bg-music");
    if (CONFIG.backgroundMusic) audio.src = toDriveVideo(CONFIG.backgroundMusic);
    else { $("#music-toggle").style.display = "none"; return; }
    const wantsPlaying = readJSON(LS.music, false);
    if (wantsPlaying) {
      audio.play().then(() => $("#music-toggle").classList.add("playing")).catch(() => {});
    }
  }
  function toggleMusic() {
    const audio = $("#bg-music");
    if (!audio.src) { toast("Add a background music link in config.js first."); return; }
    if (audio.paused) {
      audio.play().catch(() => {});
      $("#music-toggle").classList.add("playing");
      writeJSON(LS.music, true);
    } else {
      audio.pause();
      $("#music-toggle").classList.remove("playing");
      writeJSON(LS.music, false);
    }
  }

  /* ===========================================================
     EASTER EGG — Konami code
  =========================================================== */
  function listenForKonami() {
    const seq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    let pos = 0;
    on(document, "keydown", (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === seq[pos]) {
        pos++;
        if (pos === seq.length) { openEasterEgg(); pos = 0; }
      } else {
        pos = (key === seq[0]) ? 1 : 0;
      }
    });
  }
  function openEasterEgg() {
    const eg = CONFIG.easterEgg || {};
    $("#egg-title").textContent = eg.title || "You found the hidden episode.";
    $("#egg-message").textContent = eg.message || "";
    const particles = $("#egg-particles");
    particles.innerHTML = "";
    for (let i = 0; i < 26; i++) {
      const p = document.createElement("div");
      p.className = "egg-particle";
      p.textContent = Math.random() > 0.5 ? "❤" : "✦";
      p.style.left = Math.random() * 100 + "%";
      p.style.fontSize = 12 + Math.random() * 18 + "px";
      p.style.animationDuration = 4 + Math.random() * 4 + "s";
      p.style.animationDelay = Math.random() * 2 + "s";
      particles.appendChild(p);
    }
    $("#egg-overlay").classList.add("open");
  }

  /* ---------------------------------------------------------
     Boot
  --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", init);
})();
