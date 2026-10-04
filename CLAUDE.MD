# Duck T-Shirt Co — Project Context

## About
E-commerce site selling custom + pre-made t-shirt designs. Guest checkout supported. Currency: ZAR. Payment required in full before production starts — no exceptions.

## Branding
- Name: Duck T-Shirt Co
- True black theme, four brand colours as design tokens
- Duck logo in header, footer, and favicon
- No South African framing in the site's own branding/copy — SA-culture content lives only inside the design catalog itself

## Garment scope (v1)
- Standard crew-neck, regular-fit tee only
- Cut, fit, and garment type (hoodie, long sleeve, etc.) deferred to a future phase

## Catalog & rendering
- 20 launch designs, admin-editable via config, not hardcoded
- Compositional rendering: small fixed set of blank garment templates (one per colour), each design is a transparent layer composited on top at render time
- Each template defines print-zone bounding boxes (front/back/sleeve)
- Per design: only show placement options it has art for
- Placement: any subset of available zones, 1 included in base price, admin-configurable per-zone surcharge for extras
- Flag before launch, don't remove: Mandela-likeness design (rights risk), Black Label/Castle Lite designs (trademark risk)

## Home (`/`)
Hero + 3-step explainer. Featured carousel: swipe, momentum scroll, mousewheel-on-hover. Category filter pills. Featured-first, then randomized order.

## Shop (`/shop`)
Full grid, all 20 designs.

## Designer (`/designer`)
Design picker → colour → size (S–3XL) → print size → placement → quantity → live preview + total → "Pay to start production." Preview: move/resize/replace design layer within print-zone bounds, front/back flip, colour-variant flip, three view sizes. Guest checkout throughout.

## Bring Your Own Design (BYOD)
Upload → pay → production. Post-purchase: "Feature this in our catalog?" Guest + yes → nudge to create account. Either way → admin approval queue, never auto-published. Approved → live, tagged to uploader.

## Accounts & design credit
Guest checkout always available. `creditBalance` per account. `designCreditAmount` = R10 default, admin-editable. Every sale of a featured design pays the uploader — accounts only, guests earn nothing. Credit redeemed manually at checkout, never auto-applied.

## Billing
Stripe-style checkout. Full payment before production begins.

## Working style
Discuss and validate decisions before building. This file is the source of truth.