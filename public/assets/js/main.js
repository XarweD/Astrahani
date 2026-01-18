// Boot script for production:
// HTML is already present in the page (no runtime partial loading).
// We just attach per-block scripts.

function loadBlockScripts() {
  const scripts = [
    "/assets/js/blocks/header.js",
    "/assets/js/blocks/hero.js",
    "/assets/js/blocks/program.js",
    "/assets/js/blocks/gallery.js",
    "/assets/js/blocks/services.js",
    "/assets/js/blocks/addons.js",
    "/assets/js/blocks/why-us.js",
    "/assets/js/blocks/love.js",
    "/assets/js/blocks/kitchen.js",
    "/assets/js/blocks/reviews.js",
    "/assets/js/blocks/faq.js",
    "/assets/js/blocks/lead-form.js",
    "/assets/js/blocks/footer.js",
    "/assets/js/blocks/popup.js",
    "/assets/js/blocks/reveal.js",
    "/assets/js/blocks/move-parallax.js",
  ];

  for (const src of scripts) {
    const s = document.createElement("script");
    s.src = src;
    s.defer = true;
    document.body.appendChild(s);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadBlockScripts);
} else {
  loadBlockScripts();
}
