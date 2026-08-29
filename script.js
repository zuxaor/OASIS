/* =========================================================
   🌴 OASIS — SCRIPT GLOBAL
   Fond interactif • Particules • Curseur • Animations
   ========================================================= */

(() => {
  "use strict";

  /* ---------------------------------------------------------
     CONFIGURATION
     --------------------------------------------------------- */

  const CONFIG = {
    particles: {
      desktop: 45,
      tablet: 25,
      mobile: 12,
      connectionDistance: 110,
      speed: 0.25
    },

    cursor: {
      enabledOnTouch: false,
      trailLength: 8,
      particleChance: 0.08
    },

    animation: {
      observerThreshold: 0.08,
      observerRootMargin: "0px 0px -30px 0px"
    }
  };

  /* ---------------------------------------------------------
     UTILITAIRES
     --------------------------------------------------------- */

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const isTouchDevice =
    window.matchMedia("(hover: none), (pointer: coarse)").matches ||
    "ontouchstart" in window;

  const isMobile = window.innerWidth <= 640;
  const isTablet = window.innerWidth > 640 && window.innerWidth <= 1024;

  /* ---------------------------------------------------------
     FOND OASIS
     --------------------------------------------------------- */

  function createOasisBackground() {
    if (document.querySelector(".oasis-background")) return;

    const background = document.createElement("div");
    background.className = "oasis-background";
    background.setAttribute("aria-hidden", "true");

    background.innerHTML = `
      <div class="oasis-gradient"></div>
      <div class="oasis-glow oasis-glow-one"></div>
      <div class="oasis-glow oasis-glow-two"></div>
      <div class="oasis-mist oasis-mist-one"></div>
      <div class="oasis-mist oasis-mist-two"></div>
      <div class="oasis-particles"></div>
    `;

    document.body.prepend(background);

    if (!prefersReducedMotion) {
      createBackgroundParticles();
    }
  }

  function createBackgroundParticles() {
    const container = document.querySelector(".oasis-particles");
    if (!container) return;

    let amount = CONFIG.particles.desktop;

    if (isMobile) {
      amount = CONFIG.particles.mobile;
    } else if (isTablet) {
      amount = CONFIG.particles.tablet;
    }

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < amount; i++) {
      const particle = document.createElement("span");

      particle.className = "oasis-bg-particle";

      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 8}s`;
      particle.style.animationDuration = `${5 + Math.random() * 8}s`;
      particle.style.opacity = `${0.15 + Math.random() * 0.45}`;

      fragment.appendChild(particle);
    }

    container.appendChild(fragment);
  }

  /* ---------------------------------------------------------
     PARTICULES INTERACTIVES
     --------------------------------------------------------- */

  function createInteractiveParticles() {
    if (prefersReducedMotion) return;
    if (isMobile) return;

    const canvas = document.createElement("canvas");

    canvas.className = "oasis-particle-canvas";
    canvas.setAttribute("aria-hidden", "true");

    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      canvas.remove();
      return;
    }

    let width = 0;
    let height = 0;
    let animationFrame = null;
    let particles = [];

    const mouse = {
      x: null,
      y: null
    };

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * ratio;
      canvas.height = height * ratio;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      createParticles();
    }

    function getParticleAmount() {
      if (isTablet) return 25;
      return 38;
    }

    function createParticles() {
      particles = [];

      const amount = getParticleAmount();

      for (let i = 0; i < amount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 0.7 + Math.random() * 1.8,
          speedX: (Math.random() - 0.5) * CONFIG.particles.speed,
          speedY: (Math.random() - 0.5) * CONFIG.particles.speed,
          opacity: 0.15 + Math.random() * 0.45
        });
      }
    }

    function update() {
      for (const particle of particles) {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < -10) particle.x = width + 10;
        if (particle.x > width + 10) particle.x = -10;

        if (particle.y < -10) particle.y = height + 10;
        if (particle.y > height + 10) particle.y = -10;
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (const particle of particles) {
        ctx.beginPath();

        ctx.arc(
          particle.x,
          particle.y,
          particle.size,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = `rgba(180, 255, 220, ${particle.opacity})`;
        ctx.fill();
      }

      if (mouse.x !== null && mouse.y !== null) {
        for (const particle of particles) {
          const dx = particle.x - mouse.x;
          const dy = particle.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONFIG.particles.connectionDistance) {
            const opacity =
              (1 - distance / CONFIG.particles.connectionDistance) * 0.12;

            ctx.beginPath();

            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(particle.x, particle.y);

            ctx.strokeStyle = `rgba(130, 255, 210, ${opacity})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      update();
      draw();

      animationFrame = requestAnimationFrame(animate);
    }

    function handleMouseMove(event) {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    }

    function handleMouseLeave() {
      mouse.x = null;
      mouse.y = null;
    }

    function cleanup() {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);

      canvas.remove();
    }

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, {
      passive: true
    });
    window.addEventListener("mouseleave", handleMouseLeave, {
      passive: true
    });

    window.addEventListener("beforeunload", cleanup);

    resize();
    animate();
  }

  /* ---------------------------------------------------------
     CURSEUR OASIS
     --------------------------------------------------------- */

  function createOasisCursor() {
    if (prefersReducedMotion) return;
    if (isTouchDevice) return;
    if (window.innerWidth <= 900) return;

    if (document.querySelector(".oasis-cursor")) return;

    const cursor = document.createElement("div");
    const cursorDot = document.createElement("div");
    const cursorGlow = document.createElement("div");
    const cursorTrail = document.createElement("div");

    cursor.className = "oasis-cursor";
    cursorDot.className = "oasis-cursor-dot";
    cursorGlow.className = "oasis-cursor-glow";
    cursorTrail.className = "oasis-cursor-trail";

    cursor.setAttribute("aria-hidden", "true");

    cursor.appendChild(cursorGlow);
    cursor.appendChild(cursorTrail);
    cursor.appendChild(cursorDot);

    document.body.appendChild(cursor);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let currentX = mouseX;
    let currentY = mouseY;

    let previousX = mouseX;
    let previousY = mouseY;

    let animationFrame;

    const trails = [];

    function move(event) {
      mouseX = event.clientX;
      mouseY = event.clientY;
    }

    function animate() {
      currentX += (mouseX - currentX) * 0.18;
      currentY += (mouseY - currentY) * 0.18;

      const velocityX = Math.abs(mouseX - previousX);
      const velocityY = Math.abs(mouseY - previousY);

      const velocity = Math.min(
        Math.sqrt(velocityX * velocityX + velocityY * velocityY),
        20
      );

      cursor.style.transform =
        `translate3d(${currentX}px, ${currentY}px, 0)`;

      cursorGlow.style.opacity =
        `${0.35 + Math.min(velocity / 35, 0.4)}`;

      previousX = mouseX;
      previousY = mouseY;

      animationFrame = requestAnimationFrame(animate);
    }

    function createTrailParticle() {
      if (Math.random() > CONFIG.cursor.particleChance) return;

      const particle = document.createElement("span");

      particle.className = "oasis-cursor-particle";

      particle.style.left = `${currentX}px`;
      particle.style.top = `${currentY}px`;

      document.body.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 650);
    }

    function handleMove(event) {
      move(event);
      createTrailParticle();
    }

    function handleInteractiveEnter() {
      cursor.classList.add("is-interactive");
    }

    function handleInteractiveLeave() {
      cursor.classList.remove("is-interactive");
    }

    function handleClick() {
      cursor.classList.add("is-clicking");

      createClickRipple(mouseX, mouseY);

      setTimeout(() => {
        cursor.classList.remove("is-clicking");
      }, 180);
    }

    function bindInteractiveElements() {
      const selectors = [
        "button",
        "a",
        "[role='button']",
        ".card",
        ".clan-card",
        ".achievement",
        ".product-card",
        ".event-card",
        "input",
        "select",
        "textarea"
      ];

      document.querySelectorAll(selectors.join(",")).forEach((element) => {
        element.addEventListener("mouseenter", handleInteractiveEnter);
        element.addEventListener("mouseleave", handleInteractiveLeave);
      });
    }

    function cleanup() {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("click", handleClick);

      trails.forEach((trail) => trail.remove());

      cursor.remove();
    }

    window.addEventListener("mousemove", handleMove, {
      passive: true
    });

    window.addEventListener("click", handleClick);

    bindInteractiveElements();

    window.addEventListener("beforeunload", cleanup);

    animate();
  }

  /* ---------------------------------------------------------
     RIPPLE AU CLIC
     --------------------------------------------------------- */

  function createClickRipple(x, y) {
    if (prefersReducedMotion) return;

    const ripple = document.createElement("span");

    ripple.className = "oasis-click-ripple";

    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    document.body.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 550);
  }

  /* ---------------------------------------------------------
     ANIMATIONS DES ÉLÉMENTS
     --------------------------------------------------------- */

  function setupRevealAnimations() {
    const elements = document.querySelectorAll(
      ".card, " +
      ".glass-card, " +
      ".clan-card, " +
      ".achievement, " +
      ".product-card, " +
      ".event-card, " +
      ".dashboard-card, " +
      "section"
    );

    if (!elements.length) return;

    if (prefersReducedMotion) {
      elements.forEach((element) => {
        element.classList.add("oasis-visible");
      });

      return;
    }

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("oasis-visible");

          observerInstance.unobserve(entry.target);
        });
      },
      {
        threshold: CONFIG.animation.observerThreshold,
        rootMargin: CONFIG.animation.observerRootMargin
      }
    );

    elements.forEach((element) => {
      element.classList.add("oasis-reveal");
      observer.observe(element);
    });
  }

  /* ---------------------------------------------------------
     EFFET PARALLAXE LÉGER
     --------------------------------------------------------- */

  function setupParallax() {
    if (prefersReducedMotion) return;
    if (isTouchDevice) return;

    const elements = document.querySelectorAll(
      "[data-oasis-parallax]"
    );

    if (!elements.length) return;

    let ticking = false;

    function update() {
      const scrollY = window.scrollY;

      elements.forEach((element) => {
        const speed =
          Number(element.dataset.oasisParallax) || 0.08;

        element.style.transform =
          `translate3d(0, ${scrollY * speed}px, 0)`;
      });

      ticking = false;
    }

    function handleScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", handleScroll, {
      passive: true
    });
  }

  /* ---------------------------------------------------------
     HOVER MAGNÉTIQUE LÉGER
     --------------------------------------------------------- */

  function setupMagneticButtons() {
    if (prefersReducedMotion) return;
    if (isTouchDevice) return;

    const elements = document.querySelectorAll(
      "[data-oasis-magnetic]"
    );

    elements.forEach((element) => {
      element.addEventListener("mousemove", (event) => {
        const rect = element.getBoundingClientRect();

        const x =
          event.clientX -
          rect.left -
          rect.width / 2;

        const y =
          event.clientY -
          rect.top -
          rect.height / 2;

        const strength =
          Number(element.dataset.oasisMagnetic) || 0.08;

        element.style.transform =
          `translate(${x * strength}px, ${y * strength}px)`;
      });

      element.addEventListener("mouseleave", () => {
        element.style.transform = "";
      });
    });
  }

  /* ---------------------------------------------------------
     BARRES DE PROGRESSION
     --------------------------------------------------------- */

  function animateProgressBars() {
    const bars = document.querySelectorAll(
      "[data-progress]"
    );

    bars.forEach((bar) => {
      const value = Math.max(
        0,
        Math.min(100, Number(bar.dataset.progress) || 0)
      );

      if (prefersReducedMotion) {
        bar.style.width = `${value}%`;
        return;
      }

      bar.style.width = "0%";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bar.style.width = `${value}%`;
        });
      });
    });
  }

  /* ---------------------------------------------------------
     COMPTEUR ANIMÉ
     --------------------------------------------------------- */

  function animateCounters() {
    if (prefersReducedMotion) return;

    const counters = document.querySelectorAll(
      "[data-oasis-counter]"
    );

    counters.forEach((counter) => {
      const target = Number(
        counter.dataset.oasisCounter
      );

      if (!Number.isFinite(target)) return;

      const duration = 900;
      const start = performance.now();

      function update(now) {
        const progress = Math.min(
          (now - start) / duration,
          1
        );

        const eased =
          1 - Math.pow(1 - progress, 3);

        const value = Math.round(
          target * eased
        );

        counter.textContent =
          value.toLocaleString("fr-FR");

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }

      requestAnimationFrame(update);
    });
  }

  /* ---------------------------------------------------------
     DÉTECTION DU THÈME / PAGE
     --------------------------------------------------------- */

  function setupPageClass() {
    const path = window.location.pathname
      .replace(/\/+$/, "")
      .toLowerCase();

    if (!path || path === "/") {
      document.body.classList.add("page-home");
      return;
    }

    const pageName = path
      .split("/")
      .filter(Boolean)
      .pop();

    if (pageName) {
      document.body.classList.add(
        `page-${pageName.replace(/[^a-z0-9-]/g, "")}`
      );
    }
  }

  /* ---------------------------------------------------------
     PROTECTION DE BASE DES TABLEAUX
     --------------------------------------------------------- */

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  /*
   * Disponible globalement pour les scripts existants.
   * Exemple :
   *
   * const clans = Oasis.safeArray(data.clans);
   */

  window.Oasis = window.Oasis || {};

  window.Oasis.safeArray = safeArray;

  window.Oasis.safeNumber = function (value, fallback = 0) {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : fallback;
  };

  window.Oasis.safeString = function (
    value,
    fallback = ""
  ) {
    return typeof value === "string"
      ? value
      : fallback;
  };

  /* ---------------------------------------------------------
     INITIALISATION
     --------------------------------------------------------- */

  function init() {
    setupPageClass();

    createOasisBackground();
    createInteractiveParticles();
    createOasisCursor();

    setupRevealAnimations();
    setupParallax();
    setupMagneticButtons();

    animateProgressBars();
    animateCounters();

    document.documentElement.classList.add(
      "oasis-ready"
    );
  }

  /* ---------------------------------------------------------
     DOM READY
     --------------------------------------------------------- */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }

})();
