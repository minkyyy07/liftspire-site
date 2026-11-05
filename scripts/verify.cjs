/* Offline rendering only: no browser navigation or network access. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
fs.mkdirSync(path.join(root,'verification'),{recursive:true});
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const refs = [...html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)].map(m => m[1]);
for (const ref of refs) { assert(!/^(https?:)?\/\//.test(ref), 'Unexpected external request: ' + ref); assert(fs.existsSync(path.join(root, ref)), 'Missing asset: ' + ref); }
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate IDs');
for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(id), 'Broken anchor: ' + id);
for (const [, id] of html.matchAll(/aria-(?:controls|labelledby)="([^"]+)"/g)) assert(ids.includes(id), 'Broken ARIA reference: ' + id);
assert(!/<(?:form|input)\b/i.test(html), 'Preview must not collect PII');
assert(!/Russian|actual development|real screens|real development screenshots|not a made-up/i.test(html + js), 'Stale artwork claims');
assert(html.includes('Interface concept') && html.includes('Illustrative data'), 'Concept disclosure missing');
for(const name of ['today','workout','nutrition']){const svg=fs.readFileSync(path.join(root,'assets/concept-'+name+'.svg'),'utf8');assert(!/[А-Яа-яЁё]/.test(svg),'Non-English artwork');assert(svg.includes('Illustrative')||svg.includes('illustrative'),'Concept alt missing');}
assert.equal(496+768+608,1872);assert.equal(132*4+210*4+56*9,1872);assert.equal(160*4+260*4+80*9,2400);
assert(!/localStorage|sessionStorage|fetch\(|XMLHttpRequest/.test(js), 'Unexpected persistence or backend call');
const mime = file => file.endsWith('.svg') ? 'image/svg+xml' : file.endsWith('.ttf') ? 'font/ttf' : 'image/webp';
const data = file => 'data:' + mime(file) + ';base64,' + fs.readFileSync(path.join(root, file)).toString('base64');
const inlineCss = css.replace(/url\('([^']+)'\)/g, (_, file) => 'url("' + data(file) + '")');
let offline = html.replace(/<link[^>]+>/g, '').replace('<script src="app.js" defer></script>', '').replace('</head>', '<style>' + inlineCss + '</style></head>').replace(/src="(assets\/[^"]+)"/g, (_, file) => 'src="' + data(file) + '"');
(async () => {
  const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/usr/lib/node_modules/openclaw/node_modules/playwright-core');
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-background-networking'] });
  const report = { static: { assets: refs.length, anchors: [...html.matchAll(/href="#/g)].length, duplicateIds: false, piiCollection: false }, rendering: [], interactions: [], notes: ['Browser tool loopback navigation was blocked by its policy. This test renders a self-contained copy via setContent without navigating or allowing network requests.'] };
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1000}, reducedMotion:'reduce'});
    const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => {if(m.type()==='error') errors.push(m.text());});
    await page.route('**/*', route => route.abort());
    await page.setContent(offline);
    // Keep tab switching offline by resolving the three local screenshot paths to embedded data.
    await page.evaluate(images => {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
      Object.defineProperty(HTMLImageElement.prototype, 'src', { get: descriptor.get, set(value) { descriptor.set.call(this, images[value] || value); } });
    }, Object.fromEntries(['today','workout','nutrition'].map(v => ['assets/app-' + v + '.webp', data('assets/app-' + v + '.webp')])));
    await page.addScriptTag({content:js});
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#demo-image').evaluate(img => img.decode());
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({width,height:width > 760 ? 1000 : 844});
      const state = await page.evaluate(() => ({width:innerWidth, documentWidth:document.documentElement.scrollWidth, brokenImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).length, fontReady:document.fonts.check('16px Onest'), reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches, scrollBehavior:getComputedStyle(document.documentElement).scrollBehavior}));
      if(state.documentWidth > width){console.log(await page.evaluate(()=>[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,cls:e.className,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})).filter(e=>e.right>innerWidth+1||e.left<0))); await page.screenshot({path:path.join(root,'verification','overflow-debug.png'),fullPage:true});} assert(state.documentWidth <= width, 'Horizontal overflow at ' + width);
      assert.equal(state.brokenImages, 0); assert(state.fontReady); assert.equal(state.scrollBehavior,'auto');
      report.rendering.push(state);
      if(width===1440 || width===390){ await page.screenshot({path:path.join(root,'verification',width===1440?'desktop-full.png':'mobile-full.png'),fullPage:true}); await page.screenshot({path:path.join(root,'verification',width===1440?'desktop-hero.png':'mobile-hero.png')}); }
    }
    await page.setViewportSize({width:1440,height:1000});
    await page.locator('#tab-today').focus();
    for (const [key, expected] of [['ArrowDown','workout'],['ArrowRight','nutrition'],['Home','today'],['End','nutrition'],['ArrowDown','today'],['ArrowUp','nutrition']]) {
      await page.keyboard.press(key);
      assert.equal(await page.locator('[role=tab][aria-selected=true]').getAttribute('id'), 'tab-' + expected);
      assert.equal(await page.locator(':focus').getAttribute('id'), 'tab-' + expected);
      assert.equal(await page.locator('#demo-panel').getAttribute('aria-labelledby'),'tab-' + expected);
      assert.equal(await page.locator('[role=tab][tabindex="0"]').count(),1);
      report.interactions.push('Keyboard ' + key + ' → ' + expected);
    }
    await page.locator('#tab-workout').click();
    assert.match(await page.locator('#demo-title').textContent(), /next session/);
    await page.locator('[data-feature-link=nutrition]').click();
    assert.equal(await page.locator('#tab-nutrition').getAttribute('aria-selected'),'true');
    await page.locator('#demo-image').evaluate(img => img.decode());
    await page.locator('#demo-panel').screenshot({path:path.join(root,'verification','nutrition-preview.png')});
    const summary = page.locator('summary').nth(1);
    await summary.focus(); await page.keyboard.press('Enter');
    assert(await summary.evaluate(el=>el.parentElement.open));
    await page.keyboard.press('Space'); assert(!(await summary.evaluate(el=>el.parentElement.open)));
    report.interactions.push('Mouse tabs + feature CTA selects nutrition', 'Native FAQ keyboard Enter/Space toggles');
    await page.locator('#tab-today').click();
    await page.locator('.hero-actions .button').click();
    assert.equal(await page.evaluate(()=>location.hash),'#inside');
    report.interactions.push('Primary CTA navigates to interface preview');
    assert.equal(errors.length,0,'Browser errors: '+errors.join(';'));
    await page.evaluate(()=>scrollTo(0,0));
    await page.keyboard.press('Tab');
    await page.locator('.skip-link').focus(); await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>location.hash),'#main');
    report.interactions.push('Skip link keyboard navigation');
    report.pageErrors = errors;
    fs.writeFileSync(path.join(root,'verification','test-report.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify(report,null,2));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
