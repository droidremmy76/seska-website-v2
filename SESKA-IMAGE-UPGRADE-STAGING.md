# Seska — real photography upgrade (staging)
This branch is reserved for replacing placeholder/AI-reconstructed website photographs with user-provided workshop and completed-work photos. **The photos have not yet been uploaded to this branch.**
The live `main` branch is unchanged.

## Planned direct replacements
`hero-printing.jpg`, `about-hero.jpg`, `services-hero.jpg`, `products-hero.jpg`, `portfolio-hero.jpg`, `contact-hero.jpg`, `quote-hero.jpg`, `cta-print.jpg`, `production-universe.jpg`, `ideas-splash.jpg`, `work-folders.jpg`, `work-retail-front.jpg`, `branded-tshirt.jpg`, `work-polo-shirts.jpg`, `work-teardrop-flags.jpg`, `mug.jpg`, `signage-panel.jpg`.

17 image files are approved as candidate drop-in replacements. Deliverables are in the locally prepared Seska deployment package in the ChatGPT conversation. Install to `images/` on this branch. The filenames are unchanged so existing HTML image references continue to resolve.

## Held pending accuracy/consent checks
- `work-billboard.jpg` and `work-shopfront-sign.jpg` appear in a "Proof → Print" comparison, but the new photographs are different physical jobs; do not present them as before/after of one project. Hold both until page copy/paired images are corrected.
- `business-cards.jpg`, `stickers.jpg`, `rollup-banner.jpg`, `work-exhibition-booth.jpg`, `work-van-wrap.jpg`, `work-truck.jpg`, and `branded-van.jpg`: no accurately matching approved replacement in supplied photos.
- `pvc-id-card.jpg`: potential identifiable information; obtain publishing consent/redaction before use.
- `storefront.jpg`: do not substitute a different company's storefront as Seska's own.
- Review photo permissions before public posting; images are user-provided examples of printing work, not automatically verified as projects owned or completed by Seska.

## Quality checks before merge
1. Compare actual image appearance on all seven pages, desktop and mobile.
2. Ensure logos/icons/branding source files remain byte-for-byte unchanged.
3. Confirm print text and client logos are readable in relevant cards, and no portrait image is stretched.
4. Test homepage GSAP/video sequences, product gallery and portfolio lightbox.
5. Confirm each replacement is correctly described in captions and image alt text.
6. Merge to main only after visual approval.
