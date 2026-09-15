(() => {
  const html = document.documentElement;
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".scroll-progress");
  const themeToggle = document.getElementById("themeToggle");
  const menuToggle = document.getElementById("menuToggle");
  const mobilePanel = document.getElementById("mobilePanel");
  const navLinks = [
    ...document.querySelectorAll(".nav-links a, .mobile-panel a"),
  ];

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    html.dataset.theme = savedTheme;
  }

  function updateThemeButton() {
    if (!themeToggle) return;
    const light = html.dataset.theme === "light";
    themeToggle.textContent = light ? "◐" : "☀";
    themeToggle.setAttribute(
      "aria-label",
      light ? "Switch to dark theme" : "Switch to light theme",
    );
  }

  themeToggle?.addEventListener("click", () => {
    const next = html.dataset.theme === "light" ? "dark" : "light";
    html.dataset.theme = next;
    localStorage.setItem("theme", next);
    updateThemeButton();
  });
  updateThemeButton();

  function closeMenu() {
    if (!mobilePanel || !menuToggle) return;
    mobilePanel.classList.remove("active");
    mobilePanel.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    if (!mobilePanel || !menuToggle) return;
    mobilePanel.classList.add("active");
    mobilePanel.setAttribute("aria-hidden", "false");
    menuToggle.setAttribute("aria-expanded", "true");
  }

  menuToggle?.addEventListener("click", () => {
    if (mobilePanel?.classList.contains("active")) closeMenu();
    else openMenu();
  });

  mobilePanel
    ?.querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeMenu));

  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 14);
    if (progress) {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width =
        total > 0 ? `${(window.scrollY / total) * 100}%` : "0%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  document
    .querySelectorAll(".reveal")
    .forEach((el) => revealObserver.observe(el));

  const sections = [...document.querySelectorAll("main section[id]")];
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) =>
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${visible.target.id}`,
        ),
      );
    },
    { rootMargin: "-35% 0px -55%", threshold: [0, 0.2, 0.5] },
  );
  sections.forEach((section) => sectionObserver.observe(section));

  const modal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");
  const modalTitle = document.getElementById("modalTitle");
  const modalClose = document.getElementById("modalClose");
  let lastFocusedElement = null;
  let previousBodyOverflow = "";

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    modalImage.removeAttribute("src");
    document.body.style.overflow = previousBodyOverflow;
    lastFocusedElement?.focus();
    lastFocusedElement = null;
  }

  document.querySelectorAll(".project-image-button").forEach((button) => {
    button.addEventListener("click", () => {
      lastFocusedElement = button;
      previousBodyOverflow = document.body.style.overflow;
      modalImage.src = button.dataset.image || "";
      modalImage.alt = button.dataset.title || "Project preview";
      modalTitle.textContent = button.dataset.title || "";
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      modalClose?.focus();
    });
  });

  modalClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
      if (modal?.classList.contains("active")) closeModal();
    }
    if (e.key === "Tab" && modal?.classList.contains("active")) {
      const focusable = [modalClose].filter(Boolean);
      if (focusable.length && document.activeElement === focusable[0]) {
        e.preventDefault();
        focusable[0].focus();
      }
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1020) closeMenu();
  });
})();
