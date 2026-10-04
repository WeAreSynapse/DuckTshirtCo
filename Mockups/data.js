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
  { id: "orange", name: "Orange", hex: "#e8701a", price: 20 },
  { id: "blue", name: "Royal Blue", hex: "#2455b8", price: 20 },
  { id: "cyan", name: "Cyan", hex: "#1fb5c9", price: 20 },
  { id: "yellow", name: "Yellow", hex: "#e8c42a", price: 20 },
  { id: "green", name: "Green", hex: "#2f8a4a", price: 20 },
  { id: "lime", name: "Lime", hex: "#9acd32", price: 20 },
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

// Mock data for the carousel pills. In the real build these come from the database:
//   sold30  = units sold in the last 30 days   -> "Hot sellers"
//   added   = date the design went live        -> "Fresh designs"
//   uploader = approved customer upload (name) -> "Uploaded designs", credited as "by …"
// Mock dates are relative to today so the demo always has a few "new" designs.
const daysAgo = n => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
const NEW_DESIGN_DAYS = 14; // a design counts as "New Design" for this many days after it goes live
const DESIGN_META = {
  d01: { sold30: 41, added: daysAgo(124) },
  d02: { sold30: 12, added: daysAgo(124) },
  d03: { sold30: 33, added: daysAgo(16), uploader: "Thandi" },
  d04: { sold30: 58, added: daysAgo(124) },
  d05: { sold30: 27, added: daysAgo(85) },
  d06: { sold30: 9,  added: daysAgo(85) },
  d07: { sold30: 36, added: daysAgo(124) },
  d08: { sold30: 21, added: daysAgo(8), uploader: "Liam" },
  d09: { sold30: 44, added: daysAgo(60) },
  d10: { sold30: 17, added: daysAgo(124) },
  d11: { sold30: 6,  added: daysAgo(60) },
  d12: { sold30: 29, added: daysAgo(3), uploader: "Ayesha" },
};
DESIGNS.forEach(d => Object.assign(d, DESIGN_META[d.id]));

const CAROUSEL_PILLS = [
  { id: "hot",      label: "Hot sellers" },
  { id: "fresh",    label: "Fresh designs" },
  { id: "uploaded", label: "Uploaded designs" },
];
const HOT_BADGE_COUNT = 5; // top N designs by 30-day sales get the "Hot seller" badge. The pill itself is never capped.

// "What should we make next?" poll. Baseline votes are fake for the demo; the real build counts one vote per account.
const POLL = {
  question: "We make one tee for now. What should we make next?",
  note: "Vote for the style you want most.",
  options: [
    { id: "hoodie",     label: "Hoodie",         votes: 142 },
    { id: "longsleeve", label: "Long sleeve tee", votes: 87 },
    { id: "oversized",  label: "Oversized tee",   votes: 64 },
    { id: "tank",       label: "Tank top",        votes: 31 },
    { id: "kids",       label: "Kids sizes",      votes: 48 },
  ],
};
