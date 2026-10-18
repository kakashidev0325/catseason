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
const moveTrack = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? window.scrollY / max : 0;
  const value = progress.toFixed(4);
  document.documentElement.style.setProperty("--p", value);
  if (track) track.style.setProperty("--p", value);
};
moveTrack();
window.addEventListener("scroll", moveTrack, { passive: true });

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
      burstFrom(caBtn);
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
    if (ok) burstFrom(button);
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

const PAW = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 8a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm24 0a8 8 0 1 1 0 16 8 8 0 0 1 0-16zM10 24a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm44 0a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM32 28c-10 0-16 8-16 16 4 8 28 8 32 0 0-8-6-16-16-16z"/></svg>';

function burstFrom(origin) {
  if (reduceMotion) return;
  const box = origin.getBoundingClientRect();
  const cx = box.left + box.width / 2;
  const cy = box.top + box.height / 2;
  for (let i = 0; i < 12; i += 1) {
    const bit = document.createElement("span");
    bit.className = "burst";
    const angle = (Math.PI * 2 * i) / 12;
    const dist = 36 + (i % 3) * 18;
    bit.style.left = `${cx}px`;
    bit.style.top = `${cy}px`;
    bit.style.background = i % 2 ? "#e56b8a" : "#e8b84a";
    bit.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    bit.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
    document.body.appendChild(bit);
    bit.addEventListener("animationend", () => bit.remove());
  }
}

if (!reduceMotion) {
  const sky = document.createElement("div");
  sky.className = "sky";
  sky.setAttribute("aria-hidden", "true");
  const yarns = ["#e56b8a", "#6fbe3d", "#2d4a8c", "#e8b84a", "#c45d72"];
  for (let i = 0; i < 16; i += 1) {
    const wrap = document.createElement("span");
    const dot = document.createElement("i");
    const ball = i % 4 === 0;
    dot.className = ball ? "ball" : "light";
    wrap.style.left = `${(i * 6.3) % 100}%`;
    wrap.style.setProperty("--dur", `${14 + (i % 7) * 2.4}s`);
    wrap.style.setProperty("--delay", `${-i * 1.3}s`);
    wrap.style.setProperty("--sway", `${(i % 2 ? 1 : -1) * (18 + i * 3)}px`);
    dot.style.setProperty("--size", ball ? `${22 + (i % 3) * 10}px` : `${5 + (i % 3) * 2}px`);
    if (ball) dot.style.setProperty("--yarn", yarns[i % yarns.length]);
    dot.style.animationDelay = `${-i * 0.2}s`;
    wrap.appendChild(dot);
    sky.appendChild(wrap);
  }
  document.body.prepend(sky);

  const mascot = document.createElement("div");
  mascot.className = "scroll-mascot";
  mascot.setAttribute("aria-hidden", "true");
  const face = document.createElement("img");
  face.src = "logo.png";
  face.alt = "";
  mascot.appendChild(face);
  document.body.appendChild(mascot);

  const fine = window.matchMedia("(pointer: fine)").matches;
  if (fine) {
    let lastX = 0;
    let lastY = 0;
    let flip = false;
    let stamps = 0;
    window.addEventListener("pointermove", (event) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      if (Math.hypot(event.clientX - lastX, event.clientY - lastY) < 42) return;
      const angle = Math.atan2(event.clientY - lastY, event.clientX - lastX);
      lastX = event.clientX;
      lastY = event.clientY;
      if (stamps > 16) return;
      const stamp = document.createElement("span");
      stamp.className = "paw-stamp";
      stamp.style.left = `${event.clientX}px`;
      stamp.style.top = `${event.clientY}px`;
      stamp.style.setProperty("--rot", `${(angle * 180) / Math.PI + (flip ? 18 : -18)}deg`);
      stamp.innerHTML = PAW;
      flip = !flip;
      stamps += 1;
      document.body.appendChild(stamp);
      stamp.addEventListener("animationend", () => {
        stamp.remove();
        stamps -= 1;
      });
    }, { passive: true });

    document.querySelectorAll(".chapter, .meme, .cat, .social-card, .beat").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const box = card.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${(x * 9).toFixed(2)}deg) rotateX(${(-y * 8).toFixed(2)}deg) translateY(-6px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  const drifting = document.querySelectorAll(".hero-visual, .story-frame, .banner-wrap");
  if (drifting.length) {
    const glide = () => {
      drifting.forEach((el) => {
        const box = el.getBoundingClientRect();
        const shift = (box.top + box.height / 2 - window.innerHeight / 2) * -0.05;
        el.style.translate = `0 ${shift.toFixed(1)}px`;
      });
    };
    glide();
    window.addEventListener("scroll", glide, { passive: true });
  }
}
