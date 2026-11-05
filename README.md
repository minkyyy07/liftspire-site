# Liftspire website — review source

English-first, framework-free static HTML/CSS/JavaScript landing page. Interface artwork and sample data are illustrative, not a shipping app. The CTA explores the concept; platforms, pricing, languages and availability remain unconfirmed. No forms, email collection, tracking, storage or remote fonts.

## Review and verification

Serve the repository locally with `python3 -m http.server 4173 --bind 127.0.0.1`.

```sh
node --check app.js
node scripts/verify.cjs
python3 scripts/package.py
node scripts/verify-standalone.cjs
python3 scripts/release-check
```

Browser checks use Node, Chromium and playwright-core. Set PLAYWRIGHT_PATH to the installed playwright-core module path when necessary; scripts default to a common OpenClaw installation. No runtime dependencies. Reports and screenshots are generated locally, not committed. The release check intentionally fails until factual legal/hosting inputs and separate publication approval are complete. It does not certify compliance.

## Strict deployment file allowlist

The generated deployment ZIP contains exactly these 11 files, with index.html at its root:

- index.html, styles.css, app.js
- assets/logo.svg, assets/mark.svg, assets/favicon.svg, assets/onest.ttf
- assets/app-today.webp, assets/app-workout.webp, assets/app-nutrition.webp
- assets/social-preview.png

Do not deploy the entire repository root. Legacy `impressum.html` is preserved unchanged from earlier history, is incomplete, is not linked by this revision and is **not** part of the deployment allowlist. It is not an approved legal notice. No placeholder privacy/legal notice is added. Private configuration, archives, generated portable preview and verification output stay untracked.

## Publication remains blocked

Keep noindex. It is not access control. Confirm the legal operator, service address/contact and applicable jurisdiction; select the final host/domain and verify actual processing, logs, retention, recipients/transfers and applicable notices. Complete and link genuine notices before public release. Set real canonical/og:url and absolute HTTPS social-image metadata, then obtain separate publishing approval before removing noindex. A full product launch additionally requires real usable product/early-access access and verified release information.

## Branch-only deployment guard

`website-review-20261105` is an upload/review branch, not a production release. Its vercel.json sets git.deploymentEnabled to false **only for that branch**. Main and remote Vercel/domain settings are unchanged. Do not merge or publish this branch as an implicit release. Existing Vercel integration can deploy ordinary pushes; a feature branch alone does not prevent a preview deployment.
