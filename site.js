const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const reveals = document.querySelectorAll(".reveal");
if (reduceMotion || !("IntersectionObserver" in window)) {
  reveals.forEach((el) => el.classList.add("is-in"));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
  reveals.forEach((el) => revealObserver.observe(el));
}

const track = document.querySelector(".scroll-track");
if (track) {
  const moveTrack = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? window.scrollY / max : 0;
    track.style.setProperty("--p", progress.toFixed(4));
  };
  moveTrack();
  window.addEventListener("scroll", moveTrack, { passive: true });
}

const navToggle = document.querySelector(".nav-toggle");
const siteMenu = document.getElementById("site-menu");
if (navToggle && siteMenu) {
  const setMenu = (open) => {
    siteMenu.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  navToggle.addEventListener("click", () => {
    setMenu(!siteMenu.classList.contains("is-open"));
  });
  siteMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
}

const coin = document.getElementById("coin");
if (coin) {
  const scene = coin.closest(".coin-scene");
  scene.addEventListener("pointermove", (event) => {
    const box = scene.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    coin.style.transform = `rotateX(${(-y * 14).toFixed(2)}deg) rotateZ(${(x * 16).toFixed(2)}deg)`;
  });
  scene.addEventListener("pointerleave", () => {
    coin.style.transform = "";
  });
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

const caBtn = document.getElementById("ca-btn");
const caValue = document.getElementById("ca-value");
const caLabel = document.getElementById("ca-label");
if (caBtn) {
  caBtn.addEventListener("click", async () => {
    const ca = caBtn.dataset.ca;
    if (!ca) return;
    const ok = await copyText(ca);
    if (ok && caLabel) {
      caLabel.textContent = "Copied";
      setTimeout(() => { caLabel.textContent = "Copy"; }, 1400);
      return;
    }
    if (caValue) {
      const range = document.createRange();
      range.selectNodeContents(caValue);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  const label = button.textContent;
  button.addEventListener("click", async () => {
    const ok = await copyText(button.dataset.copy || "");
    button.textContent = ok ? "Copied" : "Select";
    setTimeout(() => { button.textContent = label; }, 1400);
  });
});

document.querySelectorAll("[data-count]").forEach((el) => {
  const target = Number(el.dataset.count);
  if (!Number.isFinite(target)) return;
  const paint = (value) => { el.textContent = String(value); };
  if (reduceMotion || !("IntersectionObserver" in window)) {
    paint(target);
    return;
  }
  const countObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    countObserver.disconnect();
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 700);
      paint(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, { threshold: 0.6 });
  countObserver.observe(el);
});

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
if (lightbox && lightboxImg && lightboxCaption) {
  const closeLightbox = () => {
    lightbox.hidden = true;
    lightboxImg.removeAttribute("src");
    document.body.style.overflow = "";
  };
  document.querySelectorAll(".meme-open").forEach((button) => {
    button.addEventListener("click", () => {
      const thumb = button.querySelector("img");
      lightboxImg.src = button.dataset.src || thumb?.currentSrc || thumb?.src || "";
      lightboxImg.alt = thumb?.alt || "";
      lightboxCaption.textContent = button.dataset.caption || "";
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });
  document.getElementById("lightbox-close")?.addEventListener("click", closeLightbox);
  document.getElementById("lightbox-backdrop")?.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
  });
}
