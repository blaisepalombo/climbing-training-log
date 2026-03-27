export function initMobileNav() {
  const nav = document.querySelector(".site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".site-nav-menu");

  if (!nav || !toggle || !menu) return;

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  };

  const openMenu = () => {
    toggle.setAttribute("aria-expanded", "true");
    menu.classList.add("is-open");
    document.body.classList.add("nav-open");
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    if (isOpen) closeMenu();
    else openMenu();
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 700) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}