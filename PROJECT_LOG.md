# Duck T-Shirt Co: running project log

Append-only record of the conversation, decisions and work. New entries go at the bottom; nothing above is ever edited or removed.

- The full raw transcript of each Claude Code session is also kept on disk by Claude Code: `C:\Users\Sav\.claude\projects\D---Development-Claude-Projects-DuckTshirtCo-Mockups\<session-id>.jsonl` (this session: `b573499b-5a1d-457b-9088-bf4a1297be06.jsonl`).
- Code is appended into this file whenever it changes.

---

## 2026-10-04: Session b573499b (mockup build). Catch-up entry written at 11:23

### Brief (user, start of session)
Front-end-only clickable mockup for "Duck T-Shirt Co": no backend, no real payments, mock data, no South African references in copy or content. Flow: select a tee, pick a colour, pick a design from a catalog, pick a size, then a fake checkout. Alternative path: upload your own design, which costs more (shown clearly). Plan first, wait for go-ahead.

### Plan agreed
- Plain HTML/CSS/vanilla JS, no build step. Open `Mockups/index.html` directly. Hash routes. Files: `index.html`, `styles.css`, `data.js` (all mock data), `app.js`.
- User decisions: use "R" as the currency symbol, kept in one constant (`CURRENCY` in data.js). Placeholder logo and brand colours. SVG tee with the design overlaid (no photos). Other defaults accepted.
- Placeholder brand tokens: `--brand-1 #FFC629` (yellow), `--brand-2 #FF6B2C` (orange), `--brand-3 #2EC4B6` (teal), `--brand-4 #F4F1EA` (off-white), on a true-black background.

### Changes, in order (each requested by the user)
1. **First build:** start page with two paths, then a 5-step flow (T-shirt, Colour, Design, Size, Checkout) with a live tee preview and price summary, and a fake checkout (review, details, test-mode card form, processing, confirmation). Fixed after visual checks: a badge overlapping a heading, a duplicate "Coming soon", and stepper misalignment (a `.done` class clash, renamed `.confirm`).
2. **Carousel under the hero text.** First attempt was a horizontal scrolling strip. The user rejected it ("thats not a carousel mate"). They chose a centre-focus carousel: 7 visible (the focused design plus 3 either side), arrow buttons, drag/swipe with momentum, mousewheel on hover, dots, keyboard, looping, auto-advance that pauses on hover. Clicking the centre design (or "Customise this") starts an order with that design.
3. **Centre tee 2/3 larger** (`--slide-w: clamp(220px, 40vw, 450px)`), side tees smaller (`CAR_SCALE = [1, .45, .33, .24, .18]`).
4. **"Design: …" descriptions** next to the price in the carousel caption (`tags` field per design).
5. **Design names** changed from "Placeholder NN" to: Orbit, Pyramid, Confetti, Duck, Quack, Meme, Sunset, Ripple, Bolt, Sky, Leaf, Lake.
6. **"Browse designs" opens a gallery page** (`#/shop`) in an old-Instagram profile-grid style: 3 columns, lazy-loaded in batches with a spinner. Tapping a tile starts customisation. Each design got a `showOn` tee colour that suits it.
7. **Upload studio.** "Upload your own" opens the file picker straight away (the user preferred this over a separate page). After a file is chosen, a customise page opens on a plain tee: move, resize, rotate (snaps to 15°), sliders, centre, reset, replace, remove. Anything outside the print area is clipped.
8. **Prices on gallery tiles**, always visible.
9. **Basket and itemised pricing.** The user wanted every option to be its own priced line ("all sizes, all colours, all styles, anything you would expect to be an option"):
   - Style: Crew R150 (Hoodie R350 and Long Sleeve R200 coming soon).
   - Colour: Black and White R0, Heather Grey R10, Navy and Red R20.
   - Size: S to XL R0, 2XL R20, 3XL R30.
   - Catalog design R149 per side.
   - Basket: header icon with count, Add to basket / Update item, per-item breakdown, quantity, Edit, Duplicate, Remove. Checkout is Basket, Details, Payment.
10. **Back prints** (user: "allow back print options too… and let them be different"). Front and Back tabs in the studio. Each side can be a catalog design, an upload, or left empty. Catalog designs are also movable now.
11. **Dynamic upload pricing** (user: "depending on complexity, size, colours, intricacy"). Each uploaded image is analysed in the browser for colour count, detail (edge density) and ink coverage. The price is R149 print + R100 custom design fee + tiers:
    - Print size (share of the print area, updates live): Small R0, Medium +R30, Large +R60.
    - Colours: 1–2 R0, 3–5 +R25, 6+ or photo-like +R50.
    - Detail: Simple R0, Detailed +R20, Intricate +R40.
    - All tiers are in `UPLOAD_PRICING` in data.js.

### Testing
After each change, the flow was clicked through in headless Chrome, with screenshots checked. The final run passed the whole flow: carousel pick, studio front/back, upload pricing, basket actions, a home-page upload, checkout, and a confirmation listing 3 tees. Not yet visually checked: the phone-width layout of the new basket and studio.

### Open points raised to the user
- An automatically estimated upload price conflicts with "pay in full before production". Decide whether the price is final or confirmed at the artwork check.
- The basket is in memory only and is lost on refresh.
- Print size options and sleeve placement are not built.

### Memory saved
- `home-carousel-spec`: "carousel" means the centre-focus coverflow (7 visible).

### Note on interruptions
At about 11:23 the user asked for this log. Several replies to that request were cut off by a safety classifier (no reason shown). The request itself is ordinary. This entry was written on the next attempt.

---

## 2026-10-04 11:30: Log format change

User: "no too fragmented, one file, append only." Everything now goes in this one file, code included. The separate snapshot folder was removed, and its contents are appended below.

### Code as of 2026-10-04 11:30

#### Mockups/index.html

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Duck T-Shirt Co</title>
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cellipse cx='30' cy='42' rx='22' ry='14' fill='%23FFC629'/%3E%3Ccircle cx='40' cy='22' r='12' fill='%23FFC629'/%3E%3Cpath d='M50 18 L62 23 L50 28 Z' fill='%23FF6B2C'/%3E%3Ccircle cx='43' cy='19' r='2.2'/%3E%3C/svg%3E">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="#/start" data-action="home">
      <svg class="logo" viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="30" cy="42" rx="22" ry="14" fill="var(--brand-1)"/><circle cx="40" cy="22" r="12" fill="var(--brand-1)"/><path d="M50 18 L62 23 L50 28 Z" fill="var(--brand-2)"/><circle cx="43" cy="19" r="2.2" fill="#000"/></svg>
      <span>Duck T-Shirt Co</span>
    </a>
    <div class="header-right">
      <span class="tag">Concept demo</span>
      <a class="cart-link" href="#/basket" aria-label="Basket">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7Z M9 7a3 3 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
        <span id="cart-count" hidden>0</span>
      </a>
    </div>
  </header>

  <main id="app"></main>

  <footer class="site-footer">
    <svg class="logo small" viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="30" cy="42" rx="22" ry="14" fill="var(--brand-1)"/><circle cx="40" cy="22" r="12" fill="var(--brand-1)"/><path d="M50 18 L62 23 L50 28 Z" fill="var(--brand-2)"/><circle cx="43" cy="19" r="2.2" fill="#000"/></svg>
    <span>© Duck T-Shirt Co · Concept demo. No real orders or payments.</span>
  </footer>

  <script src="data.js"></script>
  <script src="app.js"></script>
</body>
</html>

```

#### Mockups/styles.css

```css
/* Placeholder brand tokens: swap these four for the real brand colours. */
:root {
  --brand-1: #FFC629; /* duck yellow (primary) */
  --brand-2: #FF6B2C; /* orange (accent) */
  --brand-3: #2EC4B6; /* teal (secondary) */
  --brand-4: #F4F1EA; /* off-white (text) */

  --bg: #000;
  --surface: #0f0f0f;
  --surface-2: #181818;
  --line: #2a2a2a;
  --text: var(--brand-4);
  --muted: #9a978f;
  --radius: 14px;
  color-scheme: dark;
}

* { box-sizing: border-box; }
html, body { margin: 0; }
body {
  background: var(--bg);
  color: var(--text);
  font: 16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
main { flex: 1; width: 100%; max-width: 1100px; margin: 0 auto; padding: 24px 16px 48px; }
h1, h2, h3 { line-height: 1.15; margin: 0 0 12px; }
h2 { font-size: 1.5rem; }
h3 { font-size: 1rem; margin-top: 24px; }
a { color: inherit; }
button { font: inherit; color: inherit; cursor: pointer; }
button:disabled { cursor: not-allowed; }
.muted { color: var(--muted); }
.small { font-size: .875rem; }
.accent { color: var(--brand-1); }

/* header / footer */
.site-header, .site-footer {
  display: flex; align-items: center; gap: 12px;
  max-width: 1100px; width: 100%; margin: 0 auto; padding: 16px;
}
.site-header { justify-content: space-between; border-bottom: 1px solid var(--line); max-width: none; }
.site-footer { border-top: 1px solid var(--line); max-width: none; color: var(--muted); font-size: .85rem; justify-content: center; }
.brand { display: flex; align-items: center; gap: 10px; text-decoration: none; font-weight: 800; font-size: 1.15rem; }
.logo { width: 36px; height: 36px; }
.logo.small { width: 22px; height: 22px; }
.tag { font-size: .75rem; border: 1px solid var(--line); border-radius: 99px; padding: 3px 10px; color: var(--muted); }

/* buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 999px; padding: 12px 22px; font-weight: 700; text-decoration: none;
  border: 1px solid transparent;
}
.btn.primary { background: var(--brand-1); color: #000; }
.btn.primary:hover:not(:disabled) { filter: brightness(1.08); }
.btn.primary:disabled { background: var(--surface-2); color: var(--muted); }
.btn.ghost { background: transparent; border-color: var(--line); }
.btn.ghost:hover { border-color: var(--muted); }
.nav { display: flex; justify-content: space-between; gap: 12px; margin-top: 32px; }

/* hero */
.hero, .confirm { text-align: center; max-width: 820px; margin: 24px auto 0; }
.hero { max-width: none; }
.paths { max-width: 820px; margin: 0 auto; }

/* home carousel: centre-focused */
.carousel { margin: 0 0 44px; outline: none; }
.car-stage {
  --slide-w: clamp(220px, 40vw, 450px); /* centre tee width */
  position: relative; height: calc(var(--slide-w) * 1.1 + 24px); overflow: hidden;
  touch-action: pan-y; user-select: none; cursor: grab;
}
.car-stage:active { cursor: grabbing; }
.car-stage::before { /* soft glow behind the focused tee */
  content: ""; position: absolute; left: 50%; top: 50%; width: calc(var(--slide-w) * 1.5); aspect-ratio: 1;
  transform: translate(-50%, -50%); background: radial-gradient(circle, rgba(255, 198, 41, .18), transparent 65%);
  pointer-events: none;
}
.car-slide {
  position: absolute; left: 50%; top: 12px; width: var(--slide-w); margin-left: calc(var(--slide-w) / -2);
  transition: transform .5s cubic-bezier(.2, .7, .2, 1), opacity .5s; cursor: pointer;
}
.car-slide .tee { filter: drop-shadow(0 12px 24px rgba(0, 0, 0, .7)); pointer-events: none; }
.car-btn {
  position: absolute; top: 50%; z-index: 200; transform: translateY(-50%);
  width: 44px; height: 44px; border-radius: 50%; background: rgba(24, 24, 24, .9);
  border: 1px solid var(--line); font-size: 1.6rem; line-height: 1; padding-bottom: 3px;
}
.car-btn.prev { left: 4px; }
.car-btn.next { right: 4px; }
.car-btn:hover { border-color: var(--brand-1); color: var(--brand-1); }
.car-caption { display: flex; flex-direction: column; align-items: center; gap: 2px; margin-top: 6px; }
.car-caption strong { font-size: 1.25rem; }
.car-caption .btn { margin-top: 12px; }
.car-dots { display: flex; justify-content: center; gap: 8px; margin-top: 20px; }
.car-dot { width: 8px; height: 8px; padding: 0; border: 0; border-radius: 99px; background: #3a3a3a; transition: width .3s, background .3s; }
.car-dot.on { width: 24px; background: var(--brand-1); }
.hero h1, .confirm h1 { font-size: clamp(2.2rem, 6vw, 3.6rem); letter-spacing: -.02em; }
.lede { font-size: 1.125rem; color: var(--muted); max-width: 560px; margin: 0 auto 32px; }
.paths { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; text-align: left; }
.path-card {
  position: relative; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 52px 24px 28px; display: flex; flex-direction: column; gap: 4px; transition: border-color .15s, transform .15s;
}
.path-card:hover { border-color: var(--brand-1); transform: translateY(-2px); }
.path-card.upload:hover { border-color: var(--brand-2); }
.path-card h2 { margin: 0; }
.path-card p { margin: 0 0 16px; color: var(--muted); }
.price { font-size: 1.75rem; font-weight: 800; color: var(--brand-1); margin-top: auto; }
.path-card.upload .price { color: var(--brand-2); }
.price small { font-size: .9rem; font-weight: 500; color: var(--muted); }
.badge {
  position: absolute; top: 14px; right: 14px; background: var(--brand-2); color: #000;
  font-size: .75rem; font-weight: 800; padding: 4px 10px; border-radius: 99px;
}
.badge.soon { background: var(--surface-2); color: var(--muted); }
.how { list-style: none; padding: 0; margin: 40px 0 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 12px 28px; color: var(--muted); }
.how b, .stepper b {
  display: inline-grid; place-items: center; width: 26px; height: 26px; border-radius: 50%;
  background: var(--surface-2); color: var(--text); font-size: .8rem; margin-right: 8px;
}
.how b { background: var(--brand-3); color: #000; }

/* stepper */
.stepper { list-style: none; padding: 0; margin: 0 0 24px; display: flex; align-items: flex-start; gap: 6px; overflow-x: auto; scrollbar-width: none; }
.stepper li { flex: 1; min-width: max-content; display: flex; }
.stepper a, .stepper .step {
  flex: 1; height: 50px; white-space: nowrap;
  display: flex; align-items: center; padding: 10px 12px; border-radius: 10px;
  text-decoration: none; color: var(--muted); font-size: .9rem; border-bottom: 3px solid var(--line);
}
.stepper li.done a, .stepper li.done .step { color: var(--text); border-color: var(--brand-3); }
.stepper li.done b { background: var(--brand-3); color: #000; }
.stepper li.current a, .stepper li.current .step { color: var(--text); border-color: var(--brand-1); font-weight: 700; }
.stepper li.current b { background: var(--brand-1); color: #000; }

/* layout */
.layout { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 24px; align-items: start; }
.panel { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 24px; }
.summary {
  position: sticky; top: 16px; background: var(--surface); border: 1px solid var(--line);
  border-radius: var(--radius); padding: 20px;
}
.preview { background: radial-gradient(circle at 50% 40%, #2a2a2a, #111 70%); border-radius: 10px; padding: 16px; }
.tee { display: block; width: 100%; height: auto; }
.tee.mini { width: 90px; margin: 0 auto 8px; }
.tee.mid { width: 200px; }
.facts { display: grid; grid-template-columns: auto 1fr; gap: 6px 16px; margin: 16px 0; font-size: .9rem; }
.facts dt { color: var(--muted); }
.facts dd { margin: 0; text-align: right; overflow-wrap: anywhere; }
.total { display: flex; justify-content: space-between; align-items: baseline; border-top: 1px solid var(--line); padding-top: 12px; }
.total strong { font-size: 1.6rem; color: var(--brand-1); }
.summary p { margin: 4px 0 0; }

/* selectable cards */
.grid { display: grid; gap: 12px; }
.grid.tees { grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); }
.grid.designs { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
.card {
  position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 2px;
  background: var(--surface-2); border: 2px solid transparent; border-radius: 12px; padding: 16px 12px;
}
.card:hover:not(:disabled) { border-color: var(--line); }
.card.selected, .swatch.selected, .size.selected, .pill.selected { border-color: var(--brand-1); }
.card:disabled { opacity: .5; }
.card .badge { position: static; margin-top: 8px; }
.card.design img { width: 100%; aspect-ratio: 1; background: #262626; border-radius: 8px; padding: 12px; margin-bottom: 8px; }

.swatches { display: flex; flex-wrap: wrap; gap: 10px; }
.swatch {
  display: flex; align-items: center; gap: 10px; background: var(--surface-2);
  border: 2px solid transparent; border-radius: 999px; padding: 8px 16px 8px 8px;
}
.chip { width: 32px; height: 32px; border-radius: 50%; border: 1px solid rgba(255,255,255,.3); }

.pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.pill { background: var(--surface-2); border: 2px solid transparent; border-radius: 999px; padding: 6px 16px; font-size: .9rem; }
.pill.selected { background: var(--brand-1); color: #000; font-weight: 700; }

.sizes { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 8px; }
.size { min-width: 64px; padding: 14px; background: var(--surface-2); border: 2px solid transparent; border-radius: 10px; font-weight: 700; }
.qty { display: flex; align-items: center; gap: 12px; }
.qty .btn { width: 44px; height: 44px; padding: 0; font-size: 1.25rem; }
.qty output { min-width: 32px; text-align: center; font-size: 1.25rem; font-weight: 700; }

/* upload */
.dropzone {
  display: flex; align-items: center; justify-content: center; gap: 16px; text-align: left;
  min-height: 200px; padding: 24px; border: 2px dashed var(--line); border-radius: 12px; cursor: pointer;
  transition: border-color .15s, background .15s;
}
.dropzone:hover, .dropzone.over { border-color: var(--brand-2); background: rgba(255,107,44,.06); }
.dropzone img { width: 120px; height: 120px; object-fit: contain; background: #262626; border-radius: 8px; padding: 8px; }
.drop-icon { font-size: 2.5rem; color: var(--brand-2); }
.note { margin: 16px 0 0; padding: 12px 14px; border-left: 3px solid var(--brand-2); background: var(--surface-2); border-radius: 0 8px 8px 0; font-size: .9rem; }

/* checkout */
.lines { width: 100%; border-collapse: collapse; }
.lines td { padding: 14px 0; border-bottom: 1px solid var(--line); vertical-align: top; }
.lines td + td { padding-left: 12px; }
.lines .num { text-align: right; white-space: nowrap; }
.lines .fee td:first-child strong { color: var(--brand-2); }
.lines .grand td { border-bottom: 0; font-weight: 800; font-size: 1.2rem; }
.lines .grand .num { color: var(--brand-1); }

.form { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; font-size: .875rem; color: var(--muted); }
.field.full { grid-column: 1 / -1; }
.field input {
  font: inherit; font-size: 1rem; color: var(--text); background: var(--bg);
  border: 1px solid var(--line); border-radius: 8px; padding: 12px;
}
.field input:focus { outline: 2px solid var(--brand-1); outline-offset: 1px; border-color: transparent; }
.pay-box { border: 1px solid var(--line); border-radius: 12px; padding: 20px; background: var(--surface-2); }
.test-banner { background: rgba(46,196,182,.12); color: var(--brand-3); border-radius: 8px; padding: 10px 12px; font-size: .85rem; margin-bottom: 16px; }

.processing { text-align: center; padding: 48px 0; }
.spinner {
  width: 48px; height: 48px; margin: 0 auto 20px; border-radius: 50%;
  border: 4px solid var(--surface-2); border-top-color: var(--brand-1); animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* confirmation */
.check {
  width: 64px; height: 64px; margin: 0 auto 16px; display: grid; place-items: center; border-radius: 50%;
  background: var(--brand-3); color: #000; font-size: 2rem; font-weight: 900;
}
.done-card {
  display: flex; align-items: center; gap: 24px; text-align: left; background: var(--surface);
  border: 1px solid var(--line); border-radius: var(--radius); padding: 20px; margin-bottom: 20px;
}
.done-card .facts { flex: 1; }
.confirm .btn { margin-top: 12px; }

/* mobile */
@media (max-width: 820px) {
  .car-btn { width: 36px; height: 36px; font-size: 1.3rem; }
  .layout { grid-template-columns: minmax(0, 1fr); }
  .summary { position: static; order: -1; }
  .preview { max-width: 260px; margin: 0 auto; }
  .stepper span:not(.step) { display: none; }
  .stepper li.current span { display: inline; }
  .done-card { flex-direction: column; }
  .form { grid-template-columns: 1fr; }
  .nav { flex-direction: column-reverse; }
  .nav .btn { width: 100%; }
}

/* shop: old-Instagram-style profile grid */
a.path-card { text-decoration: none; }
.ig { max-width: 935px; margin: 0 auto; }
.back-link { color: var(--muted); text-decoration: none; font-size: .9rem; }
.back-link:hover { color: var(--text); }
.ig-profile {
  display: flex; align-items: center; gap: clamp(20px, 8vw, 90px);
  padding: 24px clamp(0px, 5vw, 60px) 36px; border-bottom: 1px solid var(--line);
}
.ig-avatar {
  flex: none; width: clamp(84px, 18vw, 150px); aspect-ratio: 1; border-radius: 50%;
  display: grid; place-items: center; background: var(--surface-2);
  box-shadow: 0 0 0 3px var(--bg), 0 0 0 5px var(--brand-1);
}
.ig-avatar .logo { width: 58%; height: auto; }
.ig-profile h1 { font-size: 1.7rem; font-weight: 400; margin: 0 0 14px; }
.ig-profile p { margin: 0; }
.ig-stats { list-style: none; display: flex; flex-wrap: wrap; gap: 6px 28px; padding: 0; margin: 0 0 14px; }
.ig-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(3px, 2.5vw, 28px); margin-top: clamp(3px, 2.5vw, 28px); }
.ig-tile {
  position: relative; aspect-ratio: 1; padding: 0; border: 0; overflow: hidden;
  background: radial-gradient(circle at 50% 42%, #2a2a2a, #111 75%);
  animation: ig-in .5s both; animation-delay: var(--d);
}
.ig-tile .tee { width: 78%; margin: 9% auto 0; pointer-events: none; }
.ig-over {
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  background: rgba(0, 0, 0, .55); color: #fff; font-weight: 700; opacity: 0; transition: opacity .2s;
}
.ig-over strong { font-size: 1.15rem; }
.ig-tile:hover .ig-over, .ig-tile:focus-visible .ig-over { opacity: 1; }
@keyframes ig-in { from { opacity: 0; transform: scale(.96); } }
.ig-more { display: flex; justify-content: center; align-items: center; min-height: 110px; }
.ig-more .spinner { margin: 0; width: 32px; height: 32px; }
@media (max-width: 600px) {
  .ig-profile { gap: 20px; padding-top: 16px; padding-bottom: 20px; }
  .ig-profile h1 { font-size: 1.3rem; margin-bottom: 8px; }
  .ig-stats { gap: 4px 16px; font-size: .9rem; }
  .ig-profile p { font-size: .9rem; }
}
.ig-tag {
  position: absolute; left: 8px; right: 8px; bottom: 8px; display: flex; justify-content: space-between; align-items: center; gap: 6px;
  padding: 6px 10px; border-radius: 8px; background: rgba(0, 0, 0, .7); font-size: .9rem; z-index: 1;
}
.ig-tag span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ig-tag b { color: var(--brand-1); }
@media (max-width: 600px) {
  .ig-tag { left: 4px; right: 4px; bottom: 4px; padding: 3px 6px; font-size: .7rem; border-radius: 5px; }
}

/* upload studio */
label.path-card { cursor: pointer; }
.studio { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 24px; align-items: start; }
.studio-canvas {
  position: relative; border-radius: var(--radius); border: 1px solid var(--line); padding: 24px;
  background: radial-gradient(circle at 50% 40%, #2a2a2a, #0d0d0d 70%); outline: none;
}
.studio-canvas.over { border-color: var(--brand-2); }
.studio-canvas:focus-visible { border-color: var(--brand-1); }
.studio-canvas .tee { max-width: 560px; margin: 0 auto; touch-action: none; user-select: none; }
.studio-cta {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
  display: flex; flex-direction: column; gap: 10px; align-items: stretch;
}
.studio-cta .btn { box-shadow: 0 8px 30px rgba(0, 0, 0, .5); cursor: pointer; }
.btn.solid { background: var(--surface-2); }
#st-box { cursor: move; }
.st-handle { fill: var(--brand-1); stroke: #000; stroke-width: 1.5; }
#st-rot { cursor: grab; }
#st-scale { cursor: nwse-resize; }
.studio-canvas.dragging, .studio-canvas.dragging * { cursor: grabbing; }
.studio-tools { position: sticky; top: 16px; }
.st-file { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 10px; background: var(--surface-2); margin-bottom: 18px; }
.st-file img { width: 48px; height: 48px; object-fit: contain; background: #262626; border-radius: 6px; padding: 4px; }
.st-file div { display: flex; flex-direction: column; min-width: 0; }
.st-file b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.st-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; font-size: .9rem; }
.st-row > span { display: flex; justify-content: space-between; color: var(--muted); }
.st-row output { color: var(--text); font-variant-numeric: tabular-nums; }
.st-row input[type="range"] { accent-color: var(--brand-1); width: 100%; }
.st-btns { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.btn.sm { padding: 7px 14px; font-size: .85rem; font-weight: 600; cursor: pointer; }
.studio-tools .nav { margin-top: 20px; }
@media (max-width: 820px) {
  .studio { grid-template-columns: minmax(0, 1fr); }
  .studio-canvas { padding: 12px; }
  .studio-tools { position: static; }
}

/* header basket */
.header-right { display: flex; align-items: center; gap: 14px; }
.cart-link { position: relative; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--line); text-decoration: none; }
.cart-link:hover { border-color: var(--brand-1); color: var(--brand-1); }
#cart-count {
  position: absolute; top: -4px; right: -6px; min-width: 20px; height: 20px; padding: 0 5px; border-radius: 99px;
  background: var(--brand-1); color: #000; font-size: .72rem; font-weight: 800; display: grid; place-items: center;
}
#cart-count[hidden] { display: none; }

/* itemised prices */
.breakdown { display: grid; grid-template-columns: 1fr auto; gap: 6px 16px; margin: 14px 0; font-size: .9rem; }
.breakdown dt { color: var(--muted); }
.breakdown dt span { display: block; color: var(--text); font-size: .85rem; overflow-wrap: anywhere; }
.breakdown dd { margin: 0; text-align: right; white-space: nowrap; }
.breakdown .sub { padding-left: 12px; font-size: .82rem; }
.breakdown dt.sub { border-left: 2px solid var(--line); }
.breakdown dt.sub span { display: inline; margin-left: 6px; color: var(--muted); font-size: .8rem; }
.unit { display: flex; justify-content: space-between; align-items: baseline; padding: 10px 0; border-top: 1px solid var(--line); font-size: .95rem; }
.opt-price { margin-top: 6px; font-weight: 700; color: var(--brand-1); }
.swatch > span:last-child { display: flex; flex-direction: column; text-align: left; line-height: 1.2; }
.swatch small, .size small { font-size: .72rem; color: var(--muted); font-weight: 500; }
.size { display: flex; flex-direction: column; align-items: center; gap: 2px; }

/* front + back previews */
.tee-pair { display: flex; gap: 8px; justify-content: center; }
.tee-pair figure { margin: 0; flex: 1; max-width: 100%; text-align: center; }
.tee-pair figcaption { font-size: .72rem; color: var(--muted); margin-top: 2px; }
.tee.thumb { width: 72px; margin: 0 auto; }

/* studio tabs + picker */
.tabs { display: flex; gap: 6px; margin-bottom: 10px; }
.tab { padding: 8px 18px; border-radius: 999px; border: 1px solid var(--line); background: transparent; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
.tab.on { background: var(--brand-1); color: #000; border-color: var(--brand-1); }
.tab .tick { display: inline-grid; place-items: center; width: 18px; height: 18px; border-radius: 50%; background: var(--brand-3); color: #000; }
.picker { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; max-height: 360px; overflow: auto; padding: 2px; }
.pick { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px; border-radius: 10px; background: var(--surface-2); border: 2px solid transparent; font-size: .75rem; }
.pick:hover, .pick.selected { border-color: var(--brand-1); }
.pick img { width: 100%; aspect-ratio: 1; background: #262626; border-radius: 6px; padding: 6px; }
.pick b { color: var(--brand-1); }
.st-price-title { font-size: .95rem; margin: 18px 0 0; }
.st-total { margin-top: 8px; }

/* basket */
.basket { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 24px; align-items: start; }
.b-item { display: flex; gap: 18px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 18px; margin-bottom: 14px; }
.b-thumbs { flex: none; width: 170px; }
.b-thumbs .tee.thumb { width: 100%; }
.b-body { flex: 1; min-width: 0; }
.b-head { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
.b-head h3 { margin: 0; font-size: 1.05rem; }
.b-head strong { color: var(--brand-1); font-size: 1.15rem; }
.b-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 6px; }
.qty.sm .btn { width: 34px; height: 34px; font-size: 1rem; }
.qty.sm output { font-size: 1rem; min-width: 24px; }
.basket-total { position: sticky; top: 16px; }
.basket-total .breakdown dt { color: var(--text); }
.basket-total .breakdown dt span { color: var(--muted); }
.sum-title { margin: 0 0 8px; font-size: 1.05rem; }
.btn.block { width: 100%; margin: 14px 0 8px; }
.empty-basket { text-align: center; padding: 48px 24px; }
.mini-cart { list-style: none; padding: 0; margin: 0; }
.mini-cart li { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--line); font-size: .9rem; }
.mini-cart .tee.thumb { width: 48px; margin: 0; flex: none; }
.mini-cart div { flex: 1; min-width: 0; display: flex; flex-direction: column; }

/* confirmation list */
.done-list { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 8px 20px; margin-bottom: 20px; text-align: left; }
.done-list .done-card { background: none; border: 0; border-bottom: 1px solid var(--line); border-radius: 0; padding: 12px 0; margin: 0; flex-direction: row; }
.done-list .tee-pair { width: 130px; flex: none; }
.done-info { flex: 1; display: flex; flex-direction: column; }
.done-total { display: flex; justify-content: space-between; padding: 14px 0 8px; font-size: 1.1rem; }
.done-total strong { color: var(--brand-1); }

@media (max-width: 820px) {
  .basket { grid-template-columns: minmax(0, 1fr); }
  .basket-total { position: static; }
  .b-item { flex-direction: column; }
  .b-thumbs { width: 100%; max-width: 240px; }
  .header-right .tag { display: none; }
}

```

#### Mockups/data.js

```js
// All mock data for the concept demo. Edit freely — nothing here is real.

// Currency symbol used for every price on the site. Change it here only.
const CURRENCY = "R";

// Every option has its own price. A tee's price = style + colour + size + front print + back print.
// A price of 0 shows as "Included".
const PRICES = {
  shipping: 0, // per order; 0 = free
};

// Uploaded artwork is priced automatically from the image itself (analysed in the browser), per printed side.
// Each tier applies up to and including `upTo`.
const UPLOAD_PRICING = {
  base: 149,      // printing one side (same as a catalog design)
  customFee: 100, // artwork check & setup, per uploaded side
  printSize: [    // share of the print area covered by ink, at the size the customer placed it
    { upTo: 0.25, label: "Small", price: 0 },
    { upTo: 0.6, label: "Medium", price: 30 },
    { upTo: Infinity, label: "Large", price: 60 },
  ],
  colours: [      // distinct colours detected
    { upTo: 2, price: 0 },
    { upTo: 5, price: 25 },
    { upTo: Infinity, price: 50 },
  ],
  detail: [       // edge density: simple shapes → fine linework / photos
    { upTo: 0.06, label: "Simple", price: 0 },
    { upTo: 0.15, label: "Detailed", price: 20 },
    { upTo: Infinity, label: "Intricate", price: 40 },
  ],
};

const TEES = [ // styles
  { id: "crew", name: "Classic Crew Tee", blurb: "Regular fit, crew neck, 100% cotton.", price: 150, available: true },
  { id: "hoodie", name: "Hoodie", blurb: "Heavyweight pullover with hood.", price: 350, available: false },
  { id: "longsleeve", name: "Long Sleeve Tee", blurb: "Our classic tee with long sleeves.", price: 200, available: false },
];

const COLOURS = [
  { id: "black", name: "Black", hex: "#1a1a1a", price: 0 },
  { id: "white", name: "White", hex: "#f2f2f2", price: 0 },
  { id: "grey", name: "Heather Grey", hex: "#8b8e93", price: 10 },
  { id: "navy", name: "Navy", hex: "#1f2a44", price: 20 },
  { id: "red", name: "Red", hex: "#b8322a", price: 20 },
];

const SIZES = [
  { id: "S", price: 0 },
  { id: "M", price: 0 },
  { id: "L", price: 0 },
  { id: "XL", price: 0 },
  { id: "2XL", price: 20 },
  { id: "3XL", price: 30 },
];

const CATEGORIES = ["Abstract", "Type", "Retro", "Nature"];

// Placeholder artwork: simple SVGs on a 100×100 canvas with transparent backgrounds.
// `tags` is the short design description shown as "Design: …" next to the price.
// `price` is what the design adds to the tee, per side it's printed on.
// `showOn` is the tee colour (from COLOURS) the design is displayed on in the carousel and shop grid.
const DESIGNS = [
  { id: "d01", name: "Orbit", price: 149, showOn: "black", tags: "overlapping circles, bold, colourful", category: "Abstract", featured: true,
    svg: `<circle cx="38" cy="40" r="24" fill="#FFC629"/><circle cx="62" cy="40" r="24" fill="#2EC4B6" fill-opacity=".85"/><circle cx="50" cy="62" r="24" fill="#FF6B2C" fill-opacity=".85"/>` },
  { id: "d02", name: "Pyramid", price: 149, showOn: "grey", tags: "stacked triangles, geometric, bright", category: "Abstract",
    svg: `<path d="M50 8 L92 84 H8 Z" fill="#FF6B2C"/><path d="M50 32 L74 76 H26 Z" fill="#FFC629"/><path d="M50 54 L60 72 H40 Z" fill="#2EC4B6"/>` },
  { id: "d03", name: "Confetti", price: 149, showOn: "navy", tags: "dot grid, playful, pattern", category: "Abstract",
    svg: [0, 1, 2, 3, 4].flatMap(r => [0, 1, 2, 3, 4].map(c =>
      `<circle cx="${14 + c * 18}" cy="${14 + r * 18}" r="${3 + ((r + c) % 3) * 2.5}" fill="${["#FFC629", "#2EC4B6", "#FF6B2C"][(r + c) % 3]}"/>`)).join("") },
  { id: "d04", name: "Duck", price: 149, showOn: "red", tags: "bold wordmark, duck, minimal", category: "Type", featured: true,
    svg: `<text x="50" y="62" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="30" fill="#FFC629">DUCK</text><rect x="12" y="70" width="76" height="5" fill="#FF6B2C"/>` },
  { id: "d05", name: "Quack", price: 149, showOn: "black", tags: "outline badge, quack, clean", category: "Type",
    svg: `<circle cx="50" cy="50" r="42" fill="none" stroke="#2EC4B6" stroke-width="5"/><text x="50" y="57" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="19" fill="#F4F1EA">QUACK</text>` },
  { id: "d06", name: "Meme", price: 149, showOn: "navy", tags: "repeated type, hello, colour stack", category: "Type",
    svg: `<g font-family="Arial Black, Arial, sans-serif" font-size="22" text-anchor="middle"><text x="50" y="30" fill="#FF6B2C">HELLO</text><text x="50" y="56" fill="#FFC629">HELLO</text><text x="50" y="82" fill="#2EC4B6">HELLO</text></g>` },
  { id: "d07", name: "Sunset", price: 149, showOn: "grey", tags: "retro sunset, stripes, warm", category: "Retro", featured: true,
    svg: `<defs><clipPath id="c"><circle cx="50" cy="56" r="40"/></clipPath></defs><g clip-path="url(#c)"><rect x="0" y="16" width="100" height="16" fill="#FFC629"/><rect x="0" y="36" width="100" height="12" fill="#FF6B2C"/><rect x="0" y="52" width="100" height="9" fill="#e0462a"/><rect x="0" y="65" width="100" height="6" fill="#2EC4B6"/></g>` },
  { id: "d08", name: "Ripple", price: 149, showOn: "navy", tags: "wavy lines, retro, calm", category: "Retro",
    svg: `<g fill="none" stroke-width="6" stroke-linecap="round"><path d="M10 30 Q30 15 50 30 T90 30" stroke="#FFC629"/><path d="M10 50 Q30 35 50 50 T90 50" stroke="#FF6B2C"/><path d="M10 70 Q30 55 50 70 T90 70" stroke="#2EC4B6"/></g>` },
  { id: "d09", name: "Bolt", price: 149, showOn: "black", tags: "lightning bolt, retro, energetic", category: "Retro",
    svg: `<path d="M58 6 L22 56 H46 L38 94 L80 40 H54 Z" fill="#FFC629" stroke="#FF6B2C" stroke-width="3" stroke-linejoin="round"/>` },
  { id: "d10", name: "Sky", price: 149, showOn: "navy", tags: "mountains, sun, outdoors", category: "Nature", featured: true,
    svg: `<circle cx="68" cy="30" r="14" fill="#FFC629"/><path d="M4 86 L36 36 L56 66 L68 50 L96 86 Z" fill="#2EC4B6"/><path d="M36 36 L44 48 L36 46 L29 47 Z" fill="#F4F1EA"/>` },
  { id: "d11", name: "Leaf", price: 149, showOn: "white", tags: "leaf, botanical, simple", category: "Nature",
    svg: `<path d="M50 8 C82 28 82 70 50 92 C18 70 18 28 50 8 Z" fill="#2EC4B6"/><path d="M50 18 V88 M50 40 L66 30 M50 56 L34 46 M50 70 L64 62" stroke="#0b3d38" stroke-width="3" fill="none" stroke-linecap="round"/>` },
  { id: "d12", name: "Lake", price: 149, showOn: "black", tags: "ocean wave, summer, flowing", category: "Nature",
    svg: `<path d="M6 64 C20 30 46 28 54 50 C46 44 38 52 44 60 C56 72 80 62 94 46 V86 H6 Z" fill="#2EC4B6"/><path d="M6 80 C30 66 60 92 94 72 V92 H6 Z" fill="#FFC629" fill-opacity=".9"/>` },
];

```

#### Mockups/app.js

```js
// Duck T-Shirt Co concept demo: hash-routed single page, all state in memory.

// A "side" is what's printed on the front or back of a tee:
//   { kind: "catalog", designId, aspect, place }  or
//   { kind: "upload", name, url, aspect, stats: { colours, detail, coverage }, place }
// place = { x, y (offset from print-area centre, as a fraction of its size), s (width, fraction of print area), r (degrees) }
const draftDefaults = () => ({
  path: null,      // "catalog" | "upload": how they started (sets the step order)
  tee: null,
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

// ---------- views ----------
const VIEWS = {
  start: () => `
    <section class="hero">
      <h1>Your tee, <span class="accent">your way.</span></h1>
      <p class="lede">Pick a tee, choose a colour, add a design, and we print it. You pay up front, and production starts straight away.</p>
      <div class="carousel" tabindex="0" aria-roledescription="carousel" aria-label="Featured designs">
        <div class="car-stage">
          ${CAROUSEL.map((d, i) => `
            <div class="car-slide" data-action="car-slide" data-value="${i}">${teeSVG(carHex(i), d.url)}</div>`).join("")}
          <button class="car-btn prev" data-action="car-step" data-value="-1" aria-label="Previous design">‹</button>
          <button class="car-btn next" data-action="car-step" data-value="1" aria-label="Next design">›</button>
        </div>
        <div class="car-caption" aria-live="polite">
          <strong id="car-name"></strong>
          <span class="small muted" id="car-meta"></span>
          <button class="btn primary" data-action="car-pick">Customise this</button>
        </div>
        <div class="car-dots">${CAROUSEL.map((d, i) => `
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
  "car-slide": v => {
    if (car.moved) return; // this "click" was the end of a drag
    const i = Number(v);
    i === carIndex() ? carPick(i) : carTo(i);
  },
  tee: v => { state.tee = v; render(); },
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
const carIndex = () => mod(Math.round(car.pos), CAROUSEL.length);

// Position every slide from car.pos (a float, so dragging moves smoothly between slides).
function carLayout(animate = true) {
  const stage = document.querySelector(".car-stage");
  if (!stage) return;
  const n = CAROUSEL.length;
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
  const d = CAROUSEL[carIndex()];
  document.getElementById("car-name").textContent = d.name;
  document.getElementById("car-meta").textContent = `Design: ${d.tags} · from ${money(fromPrice(d.price))}`;
  document.querySelectorAll(".car-dot").forEach((b, i) => b.classList.toggle("on", i === carIndex()));
}
const carGo = target => { car.pos = target; carLayout(true); };
const carStep = d => carGo(Math.round(car.pos) + d);
function carTo(i) { // shortest way round the loop
  const n = CAROUSEL.length;
  let diff = mod(i - carIndex(), n);
  if (diff > n / 2) diff -= n;
  carGo(Math.round(car.pos) + diff);
}
function carPick(i) {
  const d = CAROUSEL[i];
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

```
