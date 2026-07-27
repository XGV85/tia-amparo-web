document.addEventListener("DOMContentLoaded", () => {

  // Menú mòbil
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => nav.classList.remove("open"))
    );
  }

  // Capçalera reactiva a l'scroll
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Reveal en scroll (stagger per grup de germans)
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    const groups = new Map();
    revealEls.forEach((el) => {
      const parent = el.parentElement;
      const i = groups.get(parent) || 0;
      el.style.setProperty("--d", Math.min(i, 6) * 90 + "ms");
      groups.set(parent, i + 1);
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  // Comptadors animats (compten fins al valor real de data-count; si és 0, es queda a 0)
  const counters = document.querySelectorAll(".counter-card .n[data-count]");
  if (counters.length) {
    const animateCounter = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      if (target === 0) return;
      const duration = 1100;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const ioC = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            ioC.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => ioC.observe(el));
  }

  // Avatar de color amb la inicial del nom, a cada tarjeta de testimoni
  document.querySelectorAll(".testi-card .name").forEach((nameEl) => {
    const avatar = document.createElement("span");
    avatar.className = "testi-avatar";
    avatar.textContent = (nameEl.textContent.trim()[0] || "?").toUpperCase();
    nameEl.before(avatar);
  });

  // Carrusel de testimonis (home): passen d'un en un de manera automàtica, amb punts de navegació
  const carousel = document.querySelector(".testi-carousel");
  const dotsWrap = document.querySelector(".testi-dots");
  if (carousel && dotsWrap) {
    const slides = Array.from(carousel.querySelectorAll(".testi-card"));
    let current = Math.max(0, slides.findIndex((s) => s.classList.contains("active")));

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Ver testimonio ${i + 1}`);
      if (i === current) dot.classList.add("active");
      dot.addEventListener("click", () => { goTo(i); resume(); });
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function goTo(i) {
      slides[current].classList.remove("active");
      dots[current].classList.remove("active");
      current = (i + slides.length) % slides.length;
      slides[current].classList.add("active");
      dots[current].classList.add("active");
    }

    let autoplay = setInterval(() => goTo(current + 1), 4500);
    const pause = () => clearInterval(autoplay);
    const resume = () => { clearInterval(autoplay); autoplay = setInterval(() => goTo(current + 1), 4500); };
    ["mouseenter", "focusin"].forEach((ev) => carousel.addEventListener(ev, pause));
    ["mouseleave", "focusout"].forEach((ev) => carousel.addEventListener(ev, resume));
  }

  // Efecte de llum als botons seguint el cursor
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty("--mx", `${e.clientX - r.left}px`);
      btn.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  // Tilt suau de la il·lustració de l'hero, seguint el cursor (desactivat si l'usuari prefereix menys moviment)
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tiltEl = document.querySelector("[data-tilt]");
  if (tiltEl && !prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    const section = tiltEl.closest("section") || document.body;
    section.addEventListener("mousemove", (e) => {
      const r = section.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      tiltEl.style.transform = `perspective(900px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg)`;
    });
    section.addEventListener("mouseleave", () => { tiltEl.style.transform = ""; });
  }

  // Paral·laxi suau dels anells decoratius en fer scroll
  const parallaxBlobs = document.querySelectorAll(".hero .blob");
  if (parallaxBlobs.length && !prefersReduced) {
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      parallaxBlobs.forEach((b, i) => {
        b.style.setProperty("translate", `0 ${y * (0.06 + i * 0.03)}px`);
      });
    }, { passive: true });
  }
});
