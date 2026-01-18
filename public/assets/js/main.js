// Loads HTML partials into placeholders like <div data-include="/partials/header.html"></div>
// Note: locally run via `npm run dev` (Vite), so fetch works.

async function includePartials() {
  const nodes = document.querySelectorAll("[data-include]");
  for (const node of nodes) {
    const path = node.getAttribute("data-include");
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
      const html = await res.text();
      node.outerHTML = html;
    } catch (e) {
      console.error(e);
      node.outerHTML = `<div style="padding:16px;color:#ff3b3b;background:#1a1a1a;border-radius:12px;margin:12px;">
        Не удалось загрузить partial: <b>${path}</b>
      </div>`;
    }
  }
}

// Optional: load per-block JS after HTML is injected
async function loadBlockScripts() {
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

(async function boot() {
  await includePartials();
  await loadBlockScripts();
})();
