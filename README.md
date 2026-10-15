# Seska Investments Ltd — Website v2 (motion edition)

Plain HTML, CSS and JavaScript. No framework and no build step: upload the folder to any host, or open `index.html`.
(Opening from your disk works, but the halftone effect needs the site served from a web server, which any host provides.)

## Motion stack
- `js/vendor/gsap.min.js` + `ScrollTrigger.min.js` (GSAP 3.15, free for commercial use) handle the scroll choreography.
- `js/vendor/lenis.min.js` provides smooth scrolling.
- `js/main.js` holds every effect, and each one is written in print language.
- Visitors with "reduce motion" turned on get a calm, fully readable site with nothing pinned or animated.

## The motion vocabulary
| Where | Effect |
|---|---|
| First visit | Loader: CMYK layers register → logo → sheet leaves the press (once per session) |
| Every page | Floating pill nav · full-screen **printed-sheet menu** with crop and registration marks · **sheet-feed** page transitions |
| Home hero | Real production photographs cycle as the media card expands to full bleed → DIGITAL / PRINTING / AT ITS BEST separate → imagery seen **through the letters of PRINT** → doorway |
| Headlines | Masked line reveals · **vertical cut reveal** (letters lock like registration plates) |
| Technical text | Scramble / decode (`data-scramble`) |
| Numbers | Mechanical odometer (`data-odo`) |
| Ticker | Reacts to scroll speed (`data-velocity`) |
| Statement | Photos open **between the words** (`data-mbt`) |
| Services index | Flowing band enters from the edge you came in |
| What we make | **Image trail** of Seska products following the cursor/finger |
| Products | Sheet-feed entrance · draggable **3D PVC ID card** · comet tilt on premium pieces only |
| Portfolio | **Ink flood** (used once) · depth masonry · **halftone resolve** · click → image expands from its exact position |
| Process | Text along a registration line · tracing beam |
| Motto | *Customer satisfaction is our pride.* arrives slowly and holds |
| Contact | Faint technical grid · delivery routes drawn out of Kampala |
| Cursor | Crop-mark ⌜+⌟ with VIEW / PLAY / EXPLORE / OPEN, only over media (`data-cursor="…"`) |
| Buttons | CMYK registration lines · magnetic pull |
| Quote page | Deliberately calm 6-step form that morphs between steps · premium artwork upload |

## Swap in real content
- **Production photography:** the homepage uses real Seska workshop images in a timed hero slideshow; no website video elements remain.
- **Photos:** authentic Seska printing, signage, roll-up banners, branded apparel, café print and lanyard examples are in `images/`.
- **Portfolio slider:** showcases two *different* real Seska projects. It is not presented as a before-and-after of the same project.
- **Social links:** in the footer, currently `#`.

## Quote requests
The form checks each step, then opens WhatsApp (+256 200 926763) with the full request filled in.
To also receive requests by email, add a Formspree (or similar) endpoint: `<form id="quote" data-endpoint="https://formspree.io/f/XXXX" …>`
