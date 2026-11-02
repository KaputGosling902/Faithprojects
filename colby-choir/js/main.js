/* =========================================================
   COLBY CHOIR — main.js
   Renders content from js/content.js, handles nav,
   scroll reveals, hero parallax, and the lightbox.
   ========================================================= */

(function () {
  "use strict";

  const C = window.CONTENT || {};
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Inject content from content.js ---------- */

  // Simple text fills via data-fill attributes
  document.querySelectorAll("[data-fill]").forEach((el) => {
    const key = el.getAttribute("data-fill");
    if (typeof C[key] === "string") el.textContent = C[key];
  });

  // Marquee (content duplicated once so the loop is seamless)
  const track = document.getElementById("marquee-track");
  if (track && Array.isArray(C.marquee) && C.marquee.length) {
    const half = C.marquee.map((t) => `<span class="marquee__item">${t}</span>`).join("");
    track.innerHTML = half + half; // two identical halves → -50% loop
  }

  // Manifesto paragraphs
  const mWrap = document.getElementById("manifesto-paragraphs");
  if (mWrap && Array.isArray(C.manifesto)) {
    mWrap.innerHTML = C.manifesto.map((p) => `<p>${p}</p>`).join("");
  }

  // Stats
  const statsRow = document.getElementById("stats-row");
  if (statsRow && Array.isArray(C.stats)) {
    statsRow.innerHTML = C.stats
      .map(
        (s) => `
      <div class="stat">
        <span class="stat__num">${s.value}</span>
        <span class="stat__label">${s.label}</span>
      </div>`
      )
      .join("");
  }

  // Performances list
  const perfList = document.getElementById("perf-list");
  if (perfList && Array.isArray(C.performances)) {
    perfList.innerHTML = C.performances
      .map(
        (p) => `
      <li>
        <span class="perf__date"><small>${p.month}</small>${p.day}</span>
        <span class="perf__venue">${p.show} — ${p.venue}</span>
        <span class="perf__city">${p.city}</span>
        <a class="perf__cta" href="#audition">Tickets</a>
      </li>`
      )
      .join("");
  }

  /* ---------- Nav: solid on scroll ---------- */

  const nav = document.querySelector(".nav");
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("is-solid", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile full-screen menu ---------- */

  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("mobile-menu");

  function setMenu(open) {
    if (!menu || !toggle) return;
    menu.hidden = !open;
    // allow the transition to run after un-hiding
    requestAnimationFrame(() => menu.classList.toggle("is-open", open));
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (toggle && menu) {
    toggle.addEventListener("click", () =>
      setMenu(toggle.getAttribute("aria-expanded") !== "true")
    );
    menu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => setMenu(false))
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") setMenu(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */

  const reveals = document.querySelectorAll(".reveal");
  if (!reducedMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Subtle hero parallax ---------- */

  const heroImg = document.querySelector(".hero__img");
  if (heroImg && !reducedMotion) {
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < window.innerHeight * 1.2) {
            heroImg.style.transform = `translateY(${y * 0.18}px)`;
          }
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* ---------- Lightbox ---------- */

  const lightbox = document.getElementById("lightbox");
  const lbImg = lightbox && lightbox.querySelector(".lightbox__img");
  const lbCap = lightbox && lightbox.querySelector(".lightbox__cap");
  const lbClose = lightbox && lightbox.querySelector(".lightbox__close");
  let lastFocus = null;

  function openLightbox(fig) {
    if (!lightbox || !lbImg) return;
    const img = fig.querySelector("img");
    lastFocus = document.activeElement;
    lbImg.src = fig.getAttribute("data-full") || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = fig.querySelector("figcaption")?.textContent || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll(".g-item").forEach((fig) => {
    fig.setAttribute("tabindex", "0");
    fig.setAttribute("role", "button");
    fig.setAttribute(
      "aria-label",
      `Enlarge: ${fig.querySelector("img")?.alt || "gallery image"}`
    );
    fig.addEventListener("click", () => openLightbox(fig));
    fig.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(fig);
      }
    });
  });

  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lightbox) lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox && !lightbox.hidden) closeLightbox();
  });
})();
