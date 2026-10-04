// Duck T-Shirt Co concept demo: hash-routed single page, all state in memory.

// A "side" is what's printed on the front or back of a tee:
//   { kind: "catalog", designId, aspect, place }  or
//   { kind: "upload", name, url, aspect, stats: { colours, detail, coverage }, place }
// place = { x, y (offset from print-area centre, as a fraction of its size), s (width, fraction of print area), r (degrees) }
const draftDefaults = () => ({
  path: null,      // "catalog" | "upload": how they started (sets the step order)
  tee: "crew",   // preselected: it is the only style for now, so Continue is enabled straight away
  colour: null,
  size: null,
  qty: 1,
  front: null,
  back: null,
  side: "front",   // side being edited in the studio
  picker: false,   // catalog picker open in the studio
  editing: null,   // id of the basket item being edited, if any
});
const freshState = () => ({ ...draftDefaults(), fields: {}, cart: [], orderNo: null });
let state = freshState();
let cartSeq = 0;
let lastRoute = null;

const $app = document.getElementById("app");

// ---------- helpers ----------
const money = n => `${CURRENCY}${n.toLocaleString("en-US")}`;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const svgUrl = inner => "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${inner}</svg>`);
DESIGNS.forEach(d => { d.url = svgUrl(d.svg); });
const designById = id => DESIGNS.find(d => d.id === id);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const normDeg = a => ((((a + 180) % 360) + 360) % 360) - 180;
const go = route => { location.hash = "#/" + route; };

// Home carousel order: featured first, the rest shuffled once per visit.
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(p => p[1]);
const CAROUSEL = [...DESIGNS.filter(d => d.featured), ...shuffle(DESIGNS.filter(d => !d.featured))];
const carHex = i => COLOURS.find(c => c.id === CAROUSEL[i].showOn).hex; // tee colour that suits each design
const hexOf = d => COLOURS.find(c => c.id === d.showOn).hex;

// The carousel has its own list so a pill can change it without touching the shop grid.
// No pill = the default order above. One pill at a time; tapping the active one clears it.
const pillList = {
  hot: () => [...DESIGNS].sort((a, b) => b.sold30 - a.sold30), // never capped: every design, best sellers first
  fresh: () => [...DESIGNS].sort((a, b) => b.added.localeCompare(a.added)),
  uploaded: () => DESIGNS.filter(d => d.uploader),
};
let carPill = null;
let carList = CAROUSEL;
const hotIds = new Set([...DESIGNS].sort((a, b) => b.sold30 - a.sold30).slice(0, HOT_BADGE_COUNT).map(d => d.id));
const isHot = d => hotIds.has(d.id);
const isNew = d => (Date.now() - new Date(d.added)) / 864e5 <= NEW_DESIGN_DAYS;
// Comic-book "bang" starbursts drawn as SVG (original artwork, no licensed assets). The jagged outline is
// generated once; every sticker reuses it, coloured by class, with a hard black offset shadow behind it.
const BURST = (() => {
  const n = 14, pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = Math.PI * i / n - Math.PI / 2;
    const k = i % 2 ? 0.68 + 0.07 * Math.sin(i * 2.3) : 1 - 0.07 * Math.cos(i * 1.7); // slightly uneven, like hand-cut
    pts.push(`${(100 + 98 * k * Math.cos(a)).toFixed(1)},${(60 + 57 * k * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
})();
const sticker = (cls, text) => `<span class="sticker ${cls}"><svg viewBox="0 0 200 120" preserveAspectRatio="none" aria-hidden="true"><polygon class="sh" points="${BURST}" transform="translate(6 7)"/><polygon class="fg" points="${BURST}"/></svg><b>${text}</b></span>`;
const badgeOverlay = d => {
  const b = (isHot(d) ? sticker("hot", "Hot Seller!") : "") +
            (isNew(d) ? sticker("new", "New Design") : "") +
            (d.uploader ? sticker("user", "User Designs") : "");
  return b ? `<span class="ov">${b}</span>` : "";
};
const pillEmpty = id => pillList[id]().length === 0;
const carMeta = d => `Design: ${d.tags} · from ${money(fromPrice(d.price))}` +
  (d.uploader ? ` · by ${d.uploader}` : "") +
  (carPill === "hot" ? ` · ${d.sold30} sold in 30 days` : "");

const LOGO = `<svg class="logo" viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="30" cy="42" rx="22" ry="14" fill="var(--brand-1)"/><circle cx="40" cy="22" r="12" fill="var(--brand-1)"/><path d="M50 18 L62 23 L50 28 Z" fill="var(--brand-2)"/><circle cx="43" cy="19" r="2.2" fill="#000"/></svg>`;
const CHECK = `<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2.5 6.5 L5 9 L9.5 3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// ---------- tee drawing ----------
const PA = { x: 100, y: 78, w: 100, h: 120 }; // print area on the tee (front and back), in tee-SVG units
const BLANK_TEE = "#e9e9e9";                    // plain, not-yet-coloured tee
let clipSeq = 0;

const teeBody = (hex, back = false) => {
  const neck = back ? "C120 27 180 27 195 18" : "C120 42 180 42 195 18"; // the back neckline sits higher
  return `
    <path d="M105 18 ${neck} L262 44 L298 118 L250 138 L236 112 L236 318 L64 318 L64 112 L50 138 L2 118 L38 44 Z"
      fill="${hex}" stroke="rgba(255,255,255,.28)" stroke-width="2" stroke-linejoin="round"/>
    <path d="M105 18 ${neck}" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="6"/>
    <path d="M64 112 L64 128 M236 112 L236 128" stroke="rgba(0,0,0,.12)" stroke-width="2"/>`;
};

const sideUrl = side => (side.kind === "catalog" ? designById(side.designId).url : side.url);
const sideArt = side => side && { url: sideUrl(side), aspect: side.aspect, ...side.place };

// Where a placed design sits on the tee.
function artGeom(a) {
  const w = a.s * PA.w, h = w / a.aspect;
  const cx = PA.x + PA.w / 2 + a.x * PA.w, cy = PA.y + PA.h / 2 + a.y * PA.h;
  return { w, h, cx, cy, x: cx - w / 2, y: cy - h / 2 };
}

// art: a design URL drawn to fill the print area (carousel/shop), or a placed side from sideArt().
function teeSVG(hex, art, cls = "", back = false) {
  let print = "";
  if (cls !== "mini") {
    if (typeof art === "string") {
      print = `<image href="${art}" x="${PA.x}" y="${PA.y}" width="${PA.w}" height="${PA.h}" preserveAspectRatio="xMidYMid meet"/>`;
    } else if (art) {
      const g = artGeom(art), id = "pa" + ++clipSeq;
      print = `<clipPath id="${id}"><rect x="${PA.x}" y="${PA.y}" width="${PA.w}" height="${PA.h}"/></clipPath>
        <g clip-path="url(#${id})"><image href="${art.url}" x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}"
          preserveAspectRatio="none" transform="rotate(${art.r} ${g.cx} ${g.cy})"/></g>`;
    } else if (cls !== "thumb") {
      print = `<rect x="${PA.x}" y="${PA.y}" width="${PA.w}" height="${PA.h}" rx="6" fill="none" stroke="rgba(128,128,128,.6)" stroke-dasharray="6 5"/>
        <text x="150" y="143" text-anchor="middle" font-size="12" fill="rgba(128,128,128,.9)" font-family="system-ui, sans-serif">Print area</text>`;
    }
  }
  return `<svg class="tee ${cls}" viewBox="0 0 300 330" role="img" aria-label="T-shirt ${back ? "back" : "front"}">${teeBody(hex, back)}${print}</svg>`;
}

// Front and back of one tee (back only if it has a back print, unless `always`).
function teePair(it, cls = "", always = false) {
  const hex = colourOf(it)?.hex || BLANK_TEE;
  const front = `<figure>${teeSVG(hex, sideArt(it.front), cls)}<figcaption>Front</figcaption></figure>`;
  const back = `<figure>${teeSVG(hex, sideArt(it.back), cls, true)}<figcaption>Back</figcaption></figure>`;
  return `<div class="tee-pair">${front}${it.back || always ? back : ""}</div>`;
}

// ---------- pricing: every option is its own line ----------
// An "item" is a basket entry, or the tee currently being designed (draft()).
const cloneSide = s => s && { ...s, place: { ...s.place } };
const draft = () => ({
  path: state.path, tee: state.tee, colour: state.colour, size: state.size, qty: state.qty,
  front: cloneSide(state.front), back: cloneSide(state.back),
});
const colourOf = it => COLOURS.find(c => c.id === it.colour);
const sideName = side => (side.kind === "catalog" ? designById(side.designId).name : "Your design");
const itemTitle = it => {
  const names = [it.front, it.back].filter(Boolean).map(sideName);
  return `${[...new Set(names)].join(" + ")} · ${TEES.find(t => t.id === it.tee).name}`;
};

// Uploaded artwork: how much of the print area it covers at its current size (rotation doesn't change area).
const inkShare = side => {
  const g = artGeom({ aspect: side.aspect, ...side.place });
  return clamp(side.stats.coverage * (g.w * g.h) / (PA.w * PA.h), 0, 1);
};
const tier = (tiers, v) => tiers.find(t => v <= t.upTo);

function sideLines(side, where) {
  if (!side) return [{ label: `${where} print`, text: "None" }];
  if (side.kind === "catalog") {
    const d = designById(side.designId);
    return [{ label: `${where} print`, value: d.name, price: d.price }];
  }
  const U = UPLOAD_PRICING, share = inkShare(side);
  const ps = tier(U.printSize, share), cs = tier(U.colours, side.stats.colours), ds = tier(U.detail, side.stats.detail);
  return [
    { label: `${where} print`, value: `Your upload (${side.name})`, price: U.base },
    { label: "Print size", value: `${ps.label}, ${Math.round(share * 100)}% of print area`, price: ps.price, sub: true },
    { label: "Colours", value: side.stats.colours > 12 ? "full colour, photo-like" : `${side.stats.colours} detected`, price: cs.price, sub: true },
    { label: "Detail", value: ds.label, price: ds.price, sub: true },
    { label: "Custom design fee", value: "artwork check & setup", price: U.customFee, sub: true },
  ];
}
function priceLines(it) {
  const t = TEES.find(x => x.id === it.tee), c = colourOf(it), s = SIZES.find(x => x.id === it.size);
  return [
    { label: "Style", value: t?.name, price: t?.price },
    { label: "Colour", value: c?.name, price: c?.price },
    { label: "Size", value: s?.id, price: s?.price },
    ...sideLines(it.front, "Front"),
    ...sideLines(it.back, "Back"),
  ];
}
const sumLines = lines => lines.reduce((n, l) => n + (l.price ?? 0), 0);
const unitOf = it => sumLines(priceLines(it));
const lineTotal = it => unitOf(it) * it.qty;
const cartCount = () => state.cart.reduce((n, it) => n + it.qty, 0);
const cartTotal = () => state.cart.reduce((n, it) => n + lineTotal(it), 0) + PRICES.shipping;
const priceText = p => (p === 0 ? "Included" : money(p));
const plusText = p => (p === 0 ? "Included" : "+" + money(p));
const shippingText = () => (PRICES.shipping ? money(PRICES.shipping) : "Free");

// Cheapest possible tee for a given print price, for "from R…" labels.
const minPrice = arr => Math.min(...arr.map(x => x.price));
const fromPrice = printPrice => minPrice(TEES.filter(t => t.available)) + minPrice(COLOURS) + minPrice(SIZES) + printPrice;
const uploadFrom = () => fromPrice(UPLOAD_PRICING.base + UPLOAD_PRICING.customFee); // simplest artwork, all tiers at 0

const linesHTML = lines => `<dl class="breakdown">${lines.map(l => `
    <dt class="${l.sub ? "sub" : ""}">${l.label}${l.value ? `<span>${esc(l.value)}</span>` : ""}</dt>
    <dd class="${l.sub ? "sub" : ""}">${l.text ?? (l.price == null ? '<span class="muted">—</span>' : priceText(l.price))}</dd>`).join("")}
  </dl>`;
const breakdown = it => linesHTML(priceLines(it));

// ---------- uploaded artwork analysis (runs in the browser; nothing is sent anywhere) ----------
// Counts distinct colours, measures detail (edge density) and how much of the image is ink (non-transparent).
function analyseImage(img) {
  try {
    const nw = img.naturalWidth || 300, nh = img.naturalHeight || 300, k = 160 / Math.max(nw, nh);
    const w = Math.max(1, Math.round(nw * k)), h = Math.max(1, Math.round(nh * k));
    const cv = Object.assign(document.createElement("canvas"), { width: w, height: h });
    const ctx = cv.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const px = ctx.getImageData(0, 0, w, h).data;
    const lum = i => px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114;
    const differs = (i, j) => px[j + 3] < 128 || Math.abs(lum(i) - lum(j)) > 40;
    const buckets = new Map();
    let ink = 0, edges = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (px[i + 3] < 128) continue;
        ink++;
        const key = ((px[i] >> 5) << 6) | ((px[i + 1] >> 5) << 3) | (px[i + 2] >> 5); // 8 levels per channel
        buckets.set(key, (buckets.get(key) || 0) + 1);
        if (x + 1 < w && differs(i, i + 4)) edges++;
        if (y + 1 < h && differs(i, i + w * 4)) edges++;
      }
    }
    if (!ink) return { colours: 1, detail: 0, coverage: 0 };
    // colours = how many shades it takes to cover 95% of the ink (ignores anti-aliasing specks; photos score high)
    let colours = 0, covered = 0;
    for (const n of [...buckets.values()].sort((a, b) => b - a)) {
      if (covered >= ink * 0.95) break;
      covered += n;
      colours++;
    }
    return { colours, detail: edges / (ink * 2), coverage: ink / (w * h) };
  } catch {
    return { colours: 4, detail: 0.08, coverage: 0.6 }; // browser wouldn't let us read the pixels: assume mid-range
  }
}

// ---------- routing & progress ----------
// Each start point has its own step order. Checkout is separate: basket → details → payment.
const FLOWS = {
  catalog: ["tee", "colour", "design", "size"],
  upload: ["design", "colour", "size"], // only one tee style for now, so upload goes straight to the studio
};
const CHECKOUT = ["basket", "details", "payment"];
const STEP_LABEL = { tee: "T-shirt", colour: "Colour", design: "Design", size: "Size", basket: "Basket", details: "Details", payment: "Payment" };
const STEP_DONE = { tee: () => state.tee, colour: () => state.colour, design: () => state.front || state.back, size: () => state.size };
const flow = () => FLOWS[state.path];
const firstOpen = () => flow().find(s => !STEP_DONE[s]()) || "size"; // first unfinished step
const nextOf = r => flow()[flow().indexOf(r) + 1];
const prevOf = r => flow()[flow().indexOf(r) - 1] || "start";

function allowed(route) {
  if (["start", "shop", "basket"].includes(route)) return true;
  if (["details", "payment", "processing"].includes(route)) return state.cart.length > 0;
  if (!state.path) return false;
  const i = flow().indexOf(route);
  return i !== -1 && i <= flow().indexOf(firstOpen());
}

function render() {
  let route = location.hash.replace(/^#\/?/, "") || "start";
  if (route === "done") {
    if (!state.orderNo) return go("start");
  } else {
    if (!(route in VIEWS)) route = "start";
    if (!allowed(route)) {
      if (["details", "payment", "processing"].includes(route)) return go("basket");
      return go(state.path ? firstOpen() : "start");
    }
  }
  if ((route === "start" || route === "shop") && state.editing) Object.assign(state, draftDefaults()); // left an edit unfinished

  if (route === "start" || route === "shop" || route === "done") {
    $app.innerHTML = VIEWS[route]();
  } else if (route === "design" || route === "basket") {
    $app.innerHTML = stepper(route) + VIEWS[route]();
  } else {
    const checkout = ["details", "payment", "processing"].includes(route);
    $app.innerHTML = `${stepper(route)}
      <div class="layout">
        <section class="panel">${VIEWS[route]()}</section>
        <aside class="summary">${checkout ? cartSummary() : summary()}</aside>
      </div>`;
  }
  if (route === "design") studioUpdate();
  if (route === "start") { car.prev = []; carLayout(false); }
  if (route === "shop") shopInit();
  document.getElementById("cart-count").textContent = cartCount();
  document.getElementById("cart-count").hidden = !cartCount();
  if (route !== lastRoute) window.scrollTo(0, 0);
  lastRoute = route;
}

function stepper(route) {
  const inCheckout = CHECKOUT.includes(route) || route === "processing";
  const steps = inCheckout ? CHECKOUT : [...flow(), "basket"];
  const cur = inCheckout && route === "processing" ? 2 : steps.indexOf(route);
  const reached = inCheckout ? 2 : flow().indexOf(firstOpen());
  return `<ol class="stepper">${steps.map((s, i) => {
    const cls = i < cur ? "done" : i === cur ? "current" : "";
    const inner = `<b>${i < cur ? CHECK : i + 1}</b><span>${STEP_LABEL[s]}</span>`;
    const linkable = route !== "processing" && (i <= reached || s === "basket");
    return `<li class="${cls}">${linkable ? `<a href="#/${s}">${inner}</a>` : `<span class="step">${inner}</span>`}</li>`;
  }).join("")}</ol>`;
}

const nav = (back, next, ok, label = "Continue") => `
  <div class="nav">
    <a class="btn ghost" href="#/${back}">Back</a>
    <button class="btn primary" data-action="go" data-to="${next}" ${ok ? "" : "disabled"}>${label}</button>
  </div>`;

// Sidebar while designing a tee: preview + every option's price.
function summary() {
  const it = draft(), lines = priceLines(it);
  const missing = lines.some(l => l.price === undefined && !l.text);
  return `
    <div class="preview">${teePair(it)}</div>
    ${breakdown(it)}
    <div class="unit"><span>Per tee${missing ? " so far" : ""}</span><b>${money(unitOf(it))}</b></div>
    <div class="total"><span>Total${state.qty > 1 ? ` × ${state.qty}` : ""}</span><strong>${money(lineTotal(it))}</strong></div>
    ${state.cart.length ? `<p class="small"><a href="#/basket">${cartCount()} already in your basket</a></p>` : ""}`;
}

// Sidebar during checkout: what's being paid for.
function cartSummary() {
  return `
    <h3 class="sum-title">Your order</h3>
    <ul class="mini-cart">${state.cart.map(it => `
      <li>${teeSVG(colourOf(it).hex, sideArt(it.front || it.back), "thumb", !it.front)}
        <div><b>${esc(itemTitle(it))}</b><span class="small muted">${colourOf(it).name} · ${it.size} · × ${it.qty}</span></div>
        <span>${money(lineTotal(it))}</span></li>`).join("")}
    </ul>
    <dl class="breakdown"><dt>Shipping</dt><dd>${shippingText()}</dd></dl>
    <div class="total"><span>Total</span><strong>${money(cartTotal())}</strong></div>
    <p class="small"><a href="#/basket">Edit basket</a></p>`;
}

// ---------- "what should we make next?" poll (browser-only in the mockup) ----------
const POLL_KEY = "duck-poll-vote";
let pollMine = null;
try { pollMine = localStorage.getItem(POLL_KEY); } catch {}
function pollHTML() {
  const opts = POLL.options.map(o => ({ ...o, votes: o.votes + (pollMine === o.id ? 1 : 0) }));
  const total = opts.reduce((n, o) => n + o.votes, 0);
  const pct = o => Math.round(o.votes / total * 100);
  return `<section class="poll" aria-labelledby="poll-q">
    <h3 id="poll-q">${POLL.question}</h3>
    <p class="small muted">${pollMine ? `Thanks, your vote is in. ${total} votes so far.` : POLL.note}</p>
    <div class="poll-opts">${opts.map(o => pollMine
      ? `<div class="poll-res ${pollMine === o.id ? "mine" : ""}" style="--p:${pct(o)}%"><span>${o.label}</span><b>${pct(o)}%</b></div>`
      : `<button class="poll-opt" data-action="poll-vote" data-value="${o.id}">${o.label}</button>`).join("")}
    </div>
  </section>`;
}

// ---------- views ----------
const VIEWS = {
  start: () => `
    <section class="hero">
      <h1>Your tee, <span class="accent">your way.</span></h1>
      <p class="lede">Pick a tee, choose a colour, add a design, and we print it. You pay up front, and production starts straight away.</p>
      <div class="car-pills" role="group" aria-label="Show designs">${CAROUSEL_PILLS.map(p => `
        <button class="car-pill" data-action="car-pill" data-value="${p.id}" aria-pressed="${carPill === p.id}" ${pillEmpty(p.id) ? "disabled" : ""}>${p.label}</button>`).join("")}
      </div>
      <div class="carousel" tabindex="0" aria-roledescription="carousel" aria-label="Featured designs">
        <div class="car-stage">
          ${carList.map((d, i) => `
            <div class="car-slide" data-action="car-slide" data-value="${i}">${teeSVG(hexOf(d), d.url)}${badgeOverlay(d)}</div>`).join("")}
          <button class="car-btn prev" data-action="car-step" data-value="-1" aria-label="Previous design">‹</button>
          <button class="car-btn next" data-action="car-step" data-value="1" aria-label="Next design">›</button>
        </div>
        <div class="car-caption" aria-live="polite">
          <strong id="car-name"></strong>
          <span class="small muted" id="car-meta"></span>
          <button class="btn primary" data-action="car-pick">Customise this</button>
        </div>
        <div class="car-dots">${carList.map((d, i) => `
          <button class="car-dot" data-action="car-dot" data-value="${i}" aria-label="Show ${d.name}"></button>`).join("")}
        </div>
      </div>
      <div class="paths">
        <a class="path-card" href="#/shop">
          <h2>Browse designs</h2>
          <p>See every ready-made design in one place. Add a different one to the back if you like.</p>
          <span class="price"><small>from</small> ${money(fromPrice(minPrice(DESIGNS)))} <small>per tee</small></span>
        </a>
        <label class="path-card upload" tabindex="0">
          <input type="file" accept="image/png,image/jpeg,image/svg+xml" data-upload="start" hidden>
          <span class="badge">Priced on your artwork</span>
          <h2>Upload your own</h2>
          <p>Use your own artwork, then place, size and rotate it, front or back. The price depends on its size, colours and detail.</p>
          <span class="price"><small>from</small> ${money(uploadFrom())} <small>per tee</small></span>
        </label>
      </div>
      <ol class="how">
        <li><b>1</b>Choose tee, colour &amp; design</li>
        <li><b>2</b>Add to your basket</li>
        <li><b>3</b>Pay, and we start printing</li>
      </ol>
      ${pollHTML()}
    </section>`,

  shop: () => `
    <section class="ig">
      <a class="back-link" href="#/start">← Home</a>
      <header class="ig-profile">
        <div class="ig-avatar">${LOGO}</div>
        <div>
          <h1>ducktshirtco</h1>
          <ul class="ig-stats">
            <li><b>${CAROUSEL.length}</b> designs</li>
            <li><b>${CATEGORIES.length}</b> categories</li>
            <li>from <b>${money(fromPrice(minPrice(DESIGNS)))}</b> per tee</li>
          </ul>
          <p>Every design printed to order. Tap one to make it yours.</p>
        </div>
      </header>
      <div class="ig-grid" id="ig-grid"></div>
      <div class="ig-more" id="ig-more"><div class="spinner"></div></div>
    </section>`,

  tee: () => `
    <h2>Select your t-shirt</h2>
    <div class="grid tees">${TEES.map(t => `
      <button class="card ${state.tee === t.id ? "selected" : ""}" ${t.available ? `data-action="tee" data-value="${t.id}"` : "disabled"}>
        ${teeSVG("#3a3a3a", null, "mini")}
        <strong>${t.name}</strong>
        <span class="small muted">${t.blurb}</span>
        <span class="opt-price">${money(t.price)}</span>
        ${t.available ? "" : '<span class="badge soon">Coming soon</span>'}
      </button>`).join("")}
    </div>
    ${pollHTML()}
    ${nav(prevOf("tee"), nextOf("tee"), state.tee)}`,

  colour: () => `
    <h2>Pick a colour</h2>
    <div class="swatches">${COLOURS.map(c => `
      <button class="swatch ${state.colour === c.id ? "selected" : ""}" data-action="colour" data-value="${c.id}">
        <span class="chip" style="background:${c.hex}"></span>
        <span>${c.name}<small>${plusText(c.price)}</small></span>
      </button>`).join("")}
    </div>
    ${nav(prevOf("colour"), nextOf("colour"), state.colour)}`,

  design: () => studioView(),

  size: () => `
    <h2>Pick your size</h2>
    <div class="sizes">${SIZES.map(s => `
      <button class="size ${state.size === s.id ? "selected" : ""}" data-action="size" data-value="${s.id}">
        ${s.id}<small>${plusText(s.price)}</small>
      </button>`).join("")}
    </div>
    <p class="small muted">Regular fit. Size guide coming soon.</p>
    <h3>Quantity</h3>
    <div class="qty">
      <button class="btn ghost" data-action="qty" data-value="-1" aria-label="Decrease">−</button>
      <output>${state.qty}</output>
      <button class="btn ghost" data-action="qty" data-value="1" aria-label="Increase">+</button>
    </div>
    <div class="nav">
      <a class="btn ghost" href="#/${prevOf("size")}">Back</a>
      <button class="btn primary" data-action="add-to-basket" ${state.size ? "" : "disabled"}>
        ${state.editing ? "Update basket item" : "Add to basket"}</button>
    </div>`,

  basket: () => state.cart.length ? `
    <div class="basket">
      <section>
        <h2>Your basket</h2>
        ${state.cart.map(it => `
          <article class="b-item">
            <div class="b-thumbs">${teePair(it, "thumb", true)}</div>
            <div class="b-body">
              <div class="b-head">
                <h3>${esc(itemTitle(it))}</h3>
                <strong>${money(lineTotal(it))}</strong>
              </div>
              ${breakdown(it)}
              <div class="unit"><span>Per tee</span><b>${money(unitOf(it))}</b></div>
              <div class="b-actions">
                <div class="qty sm">
                  <button class="btn ghost" data-action="cart-qty" data-value="${it.id}:-1" aria-label="Decrease">−</button>
                  <output>${it.qty}</output>
                  <button class="btn ghost" data-action="cart-qty" data-value="${it.id}:1" aria-label="Increase">+</button>
                </div>
                <button class="btn ghost sm" data-action="cart-edit" data-value="${it.id}">Edit</button>
                <button class="btn ghost sm" data-action="cart-dup" data-value="${it.id}">Duplicate</button>
                <button class="btn ghost sm" data-action="cart-remove" data-value="${it.id}">Remove</button>
              </div>
            </div>
          </article>`).join("")}
        <a class="btn ghost" href="#/start">+ Design another tee</a>
      </section>
      <aside class="summary basket-total">
        <h3 class="sum-title">Order total</h3>
        <dl class="breakdown">${state.cart.map(it => `
          <dt>${esc(itemTitle(it))}<span>${colourOf(it).name} · ${it.size} · × ${it.qty}</span></dt><dd>${money(lineTotal(it))}</dd>`).join("")}
          <dt>Shipping</dt><dd>${shippingText()}</dd>
        </dl>
        <div class="total"><span>Total</span><strong>${money(cartTotal())}</strong></div>
        <button class="btn primary block" data-action="go" data-to="details">Checkout</button>
        <p class="small muted">Full payment is required before production starts.</p>
      </aside>
    </div>` : `
    <div class="panel empty-basket">
      <h2>Your basket is empty</h2>
      <p class="muted">Design a tee and add it here. You can add as many as you like before paying.</p>
      <a class="btn primary" href="#/start">Start designing</a>
    </div>`,

  details: () => `
    <h2>Your details</h2>
    <p class="small muted">Guest checkout. You don't need an account.</p>
    <div class="form">
      ${field("email", "Email", "you@example.com", "email", "full")}
      ${field("name", "Full name", "Alex Example", "text", "full")}
      ${field("address", "Address", "123 Example Street", "text", "full")}
      ${field("city", "City", "Sample City")}
      ${field("postcode", "Postal code", "0000")}
    </div>
    ${nav("basket", "payment", true, "Continue to payment")}`,

  payment: () => `
    <h2>Payment</h2>
    <div class="pay-box">
      <div class="test-banner">Test mode: no real payment is taken. Any details work.</div>
      <div class="form">
        ${field("card", "Card number", "4242 4242 4242 4242", "text", "full")}
        ${field("expiry", "Expiry", "MM / YY")}
        ${field("cvc", "CVC", "123")}
        ${field("cardname", "Name on card", "Alex Example", "text", "full")}
      </div>
    </div>
    <div class="nav">
      <a class="btn ghost" href="#/details">Back</a>
      <button class="btn primary" data-action="pay">Pay ${money(cartTotal())} to start production</button>
    </div>`,

  processing: () => `
    <div class="processing">
      <div class="spinner"></div>
      <h2>Processing payment…</h2>
      <p class="muted">This is a demo. Nothing is being charged.</p>
    </div>`,

  done: () => `
    <section class="confirm">
      <div class="check">✓</div>
      <h1>Payment received</h1>
      <p class="lede">Production has started on order <b>${state.orderNo}</b>.</p>
      <div class="done-list">${state.cart.map(it => `
        <div class="done-card">
          ${teePair(it, "thumb")}
          <div class="done-info">
            <b>${esc(itemTitle(it))}</b>
            <span class="small muted">${colourOf(it).name} · ${it.size} · × ${it.qty}</span>
          </div>
          <strong>${money(lineTotal(it))}</strong>
        </div>`).join("")}
        <div class="done-total"><span>Paid</span><strong>${money(cartTotal())}</strong></div>
      </div>
      <p class="muted">A confirmation would be sent to ${state.fields.email ? `<b>${esc(state.fields.email)}</b>` : "your inbox"}.${state.cart.some(it => [it.front, it.back].some(s => s?.kind === "upload")) ? " Our team will check your artwork before it goes to print." : ""}</p>
      <button class="btn primary" data-action="reset">Start a new order</button>
    </section>`,
};

function field(key, label, placeholder, type = "text", cls = "") {
  return `<label class="field ${cls}"><span>${label}</span>
    <input type="${type}" data-field="${key}" placeholder="${placeholder}" value="${esc(state.fields[key] || "")}"></label>`;
}

// ---------- design studio: front and back, each a catalog design or an upload, placed freely ----------
const FILE_INPUT = `<input type="file" accept="image/png,image/jpeg,image/svg+xml" data-upload hidden>`;
const cur = () => state[state.side];
const sideLabel = s => (s === "front" ? "Front" : "Back");
const defaultPlace = aspect => ({ x: 0, y: 0, s: Math.min(0.8, 0.96 * aspect), r: 0 }); // fits inside the print area
const catalogSide = id => ({ kind: "catalog", designId: id, aspect: 1, place: defaultPlace(1) });

function studioView() {
  const side = cur(), c = colour(), back = state.side === "back";
  const tabs = ["front", "back"].map(s => `
    <button class="tab ${state.side === s ? "on" : ""}" data-action="side" data-value="${s}">
      ${sideLabel(s)}${state[s] ? ` <span class="tick">${CHECK}</span>` : ""}</button>`).join("");
  return `
    <div class="studio">
      <div>
        <div class="tabs" role="tablist" aria-label="Side">${tabs}</div>
        <div class="studio-canvas" id="studio-canvas" data-drop tabindex="0" aria-label="${sideLabel(state.side)} of the tee">
          <svg id="studio-svg" class="tee" viewBox="0 0 300 330">
            ${teeBody(c ? c.hex : BLANK_TEE, back)}
            <rect x="${PA.x}" y="${PA.y}" width="${PA.w}" height="${PA.h}" rx="2" fill="none" stroke="rgba(110,110,110,.8)" stroke-width="1" stroke-dasharray="4 3"/>
            ${side ? `
              <clipPath id="studio-clip"><rect x="${PA.x}" y="${PA.y}" width="${PA.w}" height="${PA.h}"/></clipPath>
              <g clip-path="url(#studio-clip)"><image id="st-img" href="${sideUrl(side)}" preserveAspectRatio="none"/></g>
              <g id="st-sel">
                <rect id="st-box" fill="transparent" stroke="#FFC629" stroke-width="1" stroke-dasharray="3 2"/>
                <line id="st-stem" stroke="#FFC629" stroke-width="1"/>
                <circle id="st-rot" class="st-handle" r="5"/>
                <circle id="st-scale" class="st-handle" r="5"/>
              </g>` : `
              <text x="150" y="104" text-anchor="middle" font-size="9" fill="#777" font-family="system-ui, sans-serif">${sideLabel(state.side)} print area</text>`}
          </svg>
          ${side ? "" : `
            <div class="studio-cta">
              <button class="btn primary" data-action="picker" data-value="1">Choose a design</button>
              <label class="btn ghost solid">${FILE_INPUT}Upload your own</label>
            </div>`}
        </div>
      </div>
      <aside class="panel studio-tools">
        <h2>${sideLabel(state.side)} of your tee</h2>
        ${state.picker ? pickerHTML() : side ? sideTools(side) : `
          <p class="muted">${back ? "Add a different design to the back, or leave it plain." : "Pick one of our designs or upload your own."}</p>
          <div class="st-btns">
            <button class="btn ghost sm" data-action="picker" data-value="1">Choose a design</button>
            <label class="btn ghost sm">${FILE_INPUT}Upload your own</label>
          </div>
          ${back ? "" : `<p class="small muted">You can also drop an image onto the tee.</p>`}`}
        <div class="unit st-total"><span>This tee so far</span><b id="st-total"></b></div>
        ${nav(prevOf("design"), nextOf("design"), state.front || state.back, `Continue to ${STEP_LABEL[nextOf("design")].toLowerCase()}`)}
      </aside>
    </div>`;
}

function sideTools(side) {
  const upload = side.kind === "upload";
  return `
    <div class="st-file">
      <img src="${sideUrl(side)}" alt="">
      <div><b>${esc(upload ? side.name : designById(side.designId).name)}</b>
        <span class="small muted">${upload ? "Your upload" : "Catalog design"}</span></div>
    </div>
    <label class="st-row"><span>Size <output id="st-size-val"></output></span>
      <input type="range" min="10" max="120" data-place="s"></label>
    <label class="st-row"><span>Rotation <output id="st-rot-val"></output></span>
      <input type="range" min="-180" max="180" data-place="r"></label>
    <div class="st-btns">
      <button class="btn ghost sm" data-action="st-rotate" data-value="-15">⟲ 15°</button>
      <button class="btn ghost sm" data-action="st-rotate" data-value="15">⟳ 15°</button>
      <button class="btn ghost sm" data-action="st-center">Centre</button>
      <button class="btn ghost sm" data-action="st-reset">Reset</button>
    </div>
    <div class="st-btns">
      <button class="btn ghost sm" data-action="picker" data-value="1">Change design</button>
      <label class="btn ghost sm">${FILE_INPUT}${upload ? "Replace image" : "Upload instead"}</label>
      <button class="btn ghost sm" data-action="side-remove">Remove</button>
    </div>
    <p class="small muted">Drag to move. Drag the corner handle to resize and the top handle to rotate. Anything outside the dashed print area won't be printed.</p>
    <h3 class="st-price-title">${sideLabel(state.side)} print price</h3>
    <div id="st-side-price"></div>
    ${upload ? `<p class="small muted">Estimated automatically from your artwork's print size, colours and detail. It updates as you resize.</p>` : ""}`;
}

function pickerHTML() {
  return `
    <p class="small muted">Choose a design for the ${state.side}.</p>
    <div class="picker">${CAROUSEL.map(d => `
      <button class="pick ${cur()?.designId === d.id ? "selected" : ""}" data-action="pick-design" data-value="${d.id}">
        <img src="${d.url}" alt=""><span>${d.name}</span><b>${money(d.price)}</b>
      </button>`).join("")}
    </div>
    <button class="btn ghost sm" data-action="picker" data-value="">Cancel</button>`;
}

// Sync canvas, handles, sliders and live prices to the current side without re-rendering (keeps drags smooth).
function studioUpdate() {
  const total = document.getElementById("st-total");
  if (total) total.textContent = money(unitOf(draft()));
  const side = cur(), img = document.getElementById("st-img");
  if (!img || !side) return;
  const p = side.place, g = artGeom({ aspect: side.aspect, ...p });
  const set = (el, attrs) => Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  const rot = `rotate(${p.r} ${g.cx} ${g.cy})`;
  set(img, { x: g.x, y: g.y, width: g.w, height: g.h, transform: rot });
  set(document.getElementById("st-sel"), { transform: rot });
  set(document.getElementById("st-box"), { x: g.x, y: g.y, width: g.w, height: g.h });
  set(document.getElementById("st-stem"), { x1: g.cx, y1: g.y, x2: g.cx, y2: g.y - 16 });
  set(document.getElementById("st-rot"), { cx: g.cx, cy: g.y - 16 });
  set(document.getElementById("st-scale"), { cx: g.x + g.w, cy: g.y + g.h });
  const size = Math.round(p.s * 100), deg = Math.round(p.r);
  const sizeIn = document.querySelector('[data-place="s"]'), rotIn = document.querySelector('[data-place="r"]');
  if (sizeIn) { sizeIn.value = size; rotIn.value = deg; }
  const sv = document.getElementById("st-size-val"), rv = document.getElementById("st-rot-val");
  if (sv) { sv.textContent = size + "%"; rv.textContent = deg + "°"; }
  const sp = document.getElementById("st-side-price");
  if (sp) sp.innerHTML = linesHTML(sideLines(side, sideLabel(state.side)));
}

const studio = { mode: null, start: null };
function svgPoint(e) {
  const svg = document.getElementById("studio-svg");
  return new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
}
document.addEventListener("pointerdown", e => {
  const t = e.target.closest("#st-box, #st-rot, #st-scale");
  if (!t || !cur()) return;
  e.preventDefault();
  const side = cur(), p = svgPoint(e), g = artGeom({ aspect: side.aspect, ...side.place });
  studio.mode = t.id === "st-rot" ? "rotate" : t.id === "st-scale" ? "scale" : "move";
  studio.start = { p, g, place: { ...side.place }, d0: Math.hypot(p.x - g.cx, p.y - g.cy) || 1 };
  document.getElementById("studio-canvas").classList.add("dragging");
});
window.addEventListener("pointermove", e => {
  if (!studio.mode) return;
  const p = svgPoint(e), s = studio.start, pl = cur().place;
  if (studio.mode === "move") {
    pl.x = clamp(s.place.x + (p.x - s.p.x) / PA.w, -0.5, 0.5); // centre stays inside the print area
    pl.y = clamp(s.place.y + (p.y - s.p.y) / PA.h, -0.5, 0.5);
  } else if (studio.mode === "scale") {
    pl.s = clamp(s.place.s * Math.hypot(p.x - s.g.cx, p.y - s.g.cy) / s.d0, 0.1, 1.2);
  } else {
    const a = Math.atan2(p.y - s.g.cy, p.x - s.g.cx) * 180 / Math.PI + 90;
    const snapped = Math.round(a / 15) * 15;
    pl.r = normDeg(Math.abs(a - snapped) < 4 ? snapped : a); // gentle snap to 15° steps
  }
  studioUpdate();
});
window.addEventListener("pointerup", () => {
  if (!studio.mode) return;
  studio.mode = null;
  document.getElementById("studio-canvas")?.classList.remove("dragging");
});
document.addEventListener("keydown", e => {
  if (!e.target.closest?.("#studio-canvas") || !cur()) return;
  const step = e.shiftKey ? 0.05 : 0.01;
  const moves = { ArrowLeft: ["x", -step], ArrowRight: ["x", step], ArrowUp: ["y", -step], ArrowDown: ["y", step] };
  if (!moves[e.key]) return;
  e.preventDefault();
  const [k, d] = moves[e.key];
  cur().place[k] = clamp(cur().place[k] + d, -0.5, 0.5);
  studioUpdate();
});

// fromHome: picked from the home page's "Upload your own" card, so start the upload path on the front.
function setUpload(file, fromHome = false) {
  if (!file || !file.type.startsWith("image/")) return;
  const url = URL.createObjectURL(file); // kept for the session: basket items may still use it
  const img = new Image();
  img.onload = img.onerror = () => {
    const aspect = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1;
    const side = { kind: "upload", name: file.name, url, aspect, stats: analyseImage(img), place: defaultPlace(aspect) };
    if (fromHome) {
      Object.assign(state, draftDefaults(), { path: "upload", tee: "crew", front: side });
      go("design");
    } else {
      state[state.side] = side;
      state.picker = false;
      render();
    }
  };
  img.src = url;
}

// ---------- events ----------
const ACTIONS = {
  "shop-pick": v => carPick(Number(v)), // same order + colours as the carousel
  "car-step": v => carStep(Number(v)),
  "car-dot": v => carTo(Number(v)),
  "car-pick": () => carPick(carIndex()),
  "car-pill": v => carSetPill(carPill === v ? null : v),
  "car-slide": v => {
    if (car.moved) return; // this "click" was the end of a drag
    const i = Number(v);
    i === carIndex() ? carPick(i) : carTo(i);
  },
  tee: v => { state.tee = v; render(); },
  "poll-vote": v => { pollMine = v; try { localStorage.setItem(POLL_KEY, v); } catch {} render(); },
  colour: v => { state.colour = v; render(); },
  size: v => { state.size = v; render(); },
  qty: v => { state.qty = clamp(state.qty + Number(v), 1, 50); render(); },
  go: (v, el) => go(el.dataset.to),

  side: v => { state.side = v; state.picker = false; render(); },
  picker: v => { state.picker = Boolean(v); render(); },
  "pick-design": v => { state[state.side] = catalogSide(v); state.picker = false; render(); },
  "side-remove": () => { state[state.side] = null; render(); },
  "st-rotate": v => { cur().place.r = normDeg(cur().place.r + Number(v)); studioUpdate(); },
  "st-center": () => { Object.assign(cur().place, { x: 0, y: 0 }); studioUpdate(); },
  "st-reset": () => { cur().place = defaultPlace(cur().aspect); studioUpdate(); },

  "add-to-basket": () => {
    const item = { ...draft(), id: state.editing ?? ++cartSeq };
    const i = state.cart.findIndex(it => it.id === state.editing);
    if (i >= 0) state.cart[i] = item; else state.cart.push(item);
    Object.assign(state, draftDefaults());
    go("basket");
  },
  "cart-qty": v => {
    const [id, d] = v.split(":").map(Number);
    const it = state.cart.find(x => x.id === id);
    it.qty = clamp(it.qty + d, 1, 50);
    render();
  },
  "cart-remove": v => { state.cart = state.cart.filter(it => it.id !== Number(v)); render(); },
  "cart-dup": v => {
    const i = state.cart.findIndex(it => it.id === Number(v)), it = state.cart[i];
    state.cart.splice(i + 1, 0, { ...it, front: cloneSide(it.front), back: cloneSide(it.back), id: ++cartSeq });
    render();
  },
  "cart-edit": v => {
    const it = state.cart.find(x => x.id === Number(v));
    Object.assign(state, draftDefaults(), {
      path: it.path, tee: it.tee, colour: it.colour, size: it.size, qty: it.qty,
      front: cloneSide(it.front), back: cloneSide(it.back), editing: it.id,
    });
    go(flow()[0]);
  },

  pay: () => {
    go("processing");
    setTimeout(() => {
      if (location.hash !== "#/processing") return;
      state.orderNo = "DTC-" + Math.floor(100000 + Math.random() * 900000);
      go("done");
    }, 2000);
  },
  reset: () => { state = freshState(); go("start"); },
};
const colour = () => COLOURS.find(c => c.id === state.colour);

document.addEventListener("click", e => {
  const el = e.target.closest("[data-action]");
  if (!el || el.disabled) return;
  ACTIONS[el.dataset.action]?.(el.dataset.value, el);
});
document.addEventListener("input", e => {
  if (e.target.dataset.field) state.fields[e.target.dataset.field] = e.target.value;
  const k = e.target.dataset.place; // studio size / rotation sliders
  if (k && cur()) {
    cur().place[k] = k === "s" ? e.target.value / 100 : Number(e.target.value);
    studioUpdate();
  }
});
document.addEventListener("change", e => {
  if (!e.target.matches("[data-upload]")) return;
  setUpload(e.target.files[0], e.target.dataset.upload === "start");
  e.target.value = ""; // so choosing the same file again still fires
});
document.addEventListener("keydown", e => { // label "buttons" that open the file picker
  const label = e.target.closest?.("label.path-card");
  if (label && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); label.querySelector("input").click(); }
});
document.addEventListener("dragover", e => {
  const zone = e.target.closest("[data-drop]");
  if (zone) { e.preventDefault(); zone.classList.add("over"); }
});
document.addEventListener("dragleave", e => e.target.closest("[data-drop]")?.classList.remove("over"));
document.addEventListener("drop", e => {
  const zone = e.target.closest("[data-drop]");
  if (!zone) return;
  e.preventDefault();
  zone.classList.remove("over");
  setUpload(e.dataTransfer.files[0]);
});

// ---------- home carousel: centre-focused, 3 designs visible either side ----------
const CAR_SIDE = 3;          // slides visible on each side of the focused one
const CAR_AUTOPLAY_MS = 4500;
const CAR_SCALE = [1, 0.45, 0.33, 0.24, 0.18]; // size by distance from centre (last = just off-stage)
const CAR_OVERLAP = 0.75;    // how much neighbouring tees tuck behind each other (1 = edge to edge)
const lerp = (arr, a) => { const i = Math.min(Math.floor(a), arr.length - 2); return arr[i] + (arr[i + 1] - arr[i]) * (a - i); };
const car = { pos: 0, sp: 100, drag: null, moved: false, prev: [], wheelAcc: 0, wheelLock: 0 };
const mod = (a, n) => ((a % n) + n) % n;
const carIndex = () => mod(Math.round(car.pos), carList.length);

// Position every slide from car.pos (a float, so dragging moves smoothly between slides).
function carLayout(animate = true) {
  const stage = document.querySelector(".car-stage");
  if (!stage) return;
  const n = carList.length;
  const slides = stage.querySelectorAll(".car-slide");
  const w = slides[0].offsetWidth;
  // centre-to-centre distances so each tee tucks slightly behind the next; squeezed if the stage is narrow
  const xs = [0];
  for (let k = 1; k < CAR_SCALE.length; k++) xs[k] = xs[k - 1] + (CAR_SCALE[k - 1] + CAR_SCALE[k]) / 2 * w * CAR_OVERLAP;
  const fit = Math.min(1, (stage.clientWidth / 2 - CAR_SCALE[CAR_SIDE] * w / 2 - 8) / xs[CAR_SIDE]);
  xs.forEach((x, k) => { xs[k] = x * fit; });
  car.sp = xs[1]; // drag distance that moves one slide
  slides.forEach((el, i) => {
    let off = mod(i - car.pos, n);
    if (off >= n / 2) off -= n;
    const a = Math.abs(off);
    // a slide that wraps from one end to the other jumps instead of sliding across the middle
    const wrapped = car.prev[i] !== undefined && Math.abs(off - car.prev[i]) > CAR_SIDE + 0.5;
    car.prev[i] = off;
    el.style.transition = animate && !wrapped ? "" : "none";
    const ac = Math.min(a, CAR_SIDE + 1);
    el.style.transform = `translateX(${Math.sign(off) * lerp(xs, ac)}px) scale(${lerp(CAR_SCALE, ac)})`;
    el.style.opacity = a <= CAR_SIDE ? 1 - 0.22 * a : Math.max(0, 0.34 * (CAR_SIDE + 0.5 - a) / 0.5);
    el.style.zIndex = 100 - Math.round(a * 10);
    el.style.pointerEvents = a <= CAR_SIDE + 0.5 ? "" : "none";
    el.classList.toggle("focus", a < 0.5);
  });
  const d = carList[carIndex()];
  document.getElementById("car-name").textContent = d.name;
  document.getElementById("car-meta").textContent = carMeta(d);
  document.querySelectorAll(".car-dot").forEach((b, i) => b.classList.toggle("on", i === carIndex()));
}
const carGo = target => { car.pos = target; carLayout(true); };
const carStep = d => carGo(Math.round(car.pos) + d);
function carTo(i) { // shortest way round the loop
  const n = carList.length;
  let diff = mod(i - carIndex(), n);
  if (diff > n / 2) diff -= n;
  carGo(Math.round(car.pos) + diff);
}
// Swap the carousel's list (null = default). Rebuilds slides + dots, restarts at the first design.
function carSetPill(id) {
  carPill = id;
  carList = id ? pillList[id]() : CAROUSEL;
  const stage = document.querySelector(".car-stage");
  if (!stage) return;
  stage.querySelectorAll(".car-slide").forEach(el => el.remove());
  const btn = stage.querySelector(".car-btn.prev");
  btn.insertAdjacentHTML("beforebegin", carList.map((d, i) => `
    <div class="car-slide" data-action="car-slide" data-value="${i}">${teeSVG(hexOf(d), d.url)}${badgeOverlay(d)}</div>`).join(""));
  document.querySelector(".car-dots").innerHTML = carList.map((d, i) => `
    <button class="car-dot" data-action="car-dot" data-value="${i}" aria-label="Show ${d.name}"></button>`).join("");
  document.querySelectorAll(".car-pill").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.value === id)));
  car.pos = 0;
  car.prev = [];
  carLayout(false);
}
function carPick(i) {
  const d = carList[i];
  // keep the colour they saw (still changeable); the back starts plain
  Object.assign(state, draftDefaults(), { path: "catalog", front: catalogSide(d.id), colour: d.showOn });
  go("tee");
}

// drag / swipe with a momentum flick
document.addEventListener("pointerdown", e => {
  if (!e.target.closest(".car-stage") || e.target.closest(".car-btn") || e.button !== 0) return;
  if (e.pointerType === "mouse") e.preventDefault(); // no text selection or image ghost-drag
  car.drag = { x: e.clientX, pos: car.pos, lastX: e.clientX, lastT: performance.now(), v: 0 };
  car.moved = false;
});
window.addEventListener("pointermove", e => {
  if (!car.drag) return;
  const dx = e.clientX - car.drag.x;
  if (Math.abs(dx) > 6) car.moved = true;
  car.pos = car.drag.pos - dx / car.sp;
  const now = performance.now();
  car.drag.v = (car.drag.lastX - e.clientX) / car.sp / Math.max(1, now - car.drag.lastT); // slides per ms
  car.drag.lastX = e.clientX;
  car.drag.lastT = now;
  carLayout(false);
});
const carRelease = () => {
  if (!car.drag) return;
  const v = performance.now() - car.drag.lastT > 80 ? 0 : car.drag.v; // no flick if the pointer had stopped
  car.drag = null;
  const base = Math.round(car.pos);
  carGo(Math.max(base - 6, Math.min(base + 6, Math.round(car.pos + v * 300))));
  setTimeout(() => { car.moved = false; }); // after the trailing click has been ignored
};
window.addEventListener("pointerup", carRelease);
window.addEventListener("pointercancel", carRelease);

// mousewheel while hovering: one design per wheel notch
document.addEventListener("wheel", e => {
  if (!e.target.closest(".car-stage")) return;
  e.preventDefault();
  const now = performance.now();
  if (now < car.wheelLock) { car.wheelAcc = 0; return; }
  const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  car.wheelAcc += d * (e.deltaMode === 1 ? 16 : 1);
  if (Math.abs(car.wheelAcc) >= 40) {
    carStep(Math.sign(car.wheelAcc));
    car.wheelAcc = 0;
    car.wheelLock = now + 90;
  }
}, { passive: false });

document.addEventListener("keydown", e => {
  if (!e.target.closest?.(".carousel")) return;
  if (e.key === "ArrowLeft") carStep(-1);
  if (e.key === "ArrowRight") carStep(1);
});
window.addEventListener("resize", () => carLayout(false));

// auto-advance, paused while hovered, dragged or the tab is hidden
setInterval(() => {
  const c = document.querySelector(".carousel");
  if (!c || car.drag || c.matches(":hover") || document.hidden) return;
  carStep(1);
}, CAR_AUTOPLAY_MS);

// ---------- shop grid: Instagram-style, lazy-loaded in batches as you scroll ----------
const SHOP_BATCH = 6;
const SHOP_DELAY_MS = 700; // fake network wait so the lazy load is visible in the demo
const shop = { shown: 0, loading: false, timer: 0 };
const shopObserver = new IntersectionObserver(entries => {
  if (entries.some(e => e.isIntersecting)) shopLoadMore();
});

function shopInit() {
  clearTimeout(shop.timer);
  Object.assign(shop, { shown: 0, loading: false });
  shopLoadMore(true);
  shopObserver.disconnect();
  shopObserver.observe(document.getElementById("ig-more"));
}

function shopLoadMore(instant = false) {
  if (shop.loading || shop.shown >= CAROUSEL.length) return;
  shop.loading = true;
  shop.timer = setTimeout(() => {
    const grid = document.getElementById("ig-grid");
    if (!grid) return;
    const next = CAROUSEL.slice(shop.shown, shop.shown + SHOP_BATCH);
    grid.insertAdjacentHTML("beforeend", next.map((d, k) => {
      const i = shop.shown + k;
      return `<button class="ig-tile" data-action="shop-pick" data-value="${i}" style="--d:${k * 60}ms" aria-label="${d.name}">
        ${teeSVG(carHex(i), d.url)}
        ${badgeOverlay(d)}
        <span class="ig-tag"><span>${d.name}</span><b>from ${money(fromPrice(d.price))}</b></span>
        <span class="ig-over"><strong>Customise →</strong></span>
      </button>`;
    }).join(""));
    shop.shown += next.length;
    shop.loading = false;
    const more = document.getElementById("ig-more");
    if (shop.shown >= CAROUSEL.length) {
      more.innerHTML = `<p class="small muted">That's every design. More coming soon.</p>`;
    } else if (more.getBoundingClientRect().top < innerHeight) {
      shopLoadMore(); // spinner still on screen: the observer won't fire again, so keep loading
    }
  }, instant ? 0 : SHOP_DELAY_MS);
}

window.addEventListener("hashchange", render);
render();
