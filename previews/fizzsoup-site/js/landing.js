(function () {
  const btn = document.querySelector("[data-menu]");
  const drawer = document.querySelector("[data-drawer]");
  if (btn && drawer) {
    const set = (open) => {
      drawer.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open && window.innerWidth <= 820 ? "hidden" : "";
    };
    btn.addEventListener("click", () => set(!drawer.classList.contains("is-open")));
    drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) set(false);
    });
  }
  document.querySelectorAll("form[role='search']").forEach((form) => {
    form.addEventListener("submit", (e) => e.preventDefault());
  });
})();
