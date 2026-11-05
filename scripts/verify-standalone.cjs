'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
fs.mkdirSync(path.join(root,'verification'),{recursive:true});
(async()=>{
  const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/usr/lib/node_modules/openclaw/node_modules/playwright-core');
  const browser = await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-background-networking']});
  try{
    const page = await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
    const errors=[]; const requests=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error') errors.push(m.text());});
    await page.route('**/*',route=>{requests.push(route.request().url());return route.abort();});
    await page.setContent(fs.readFileSync(path.join(root,'liftspire-preview.html'),'utf8'));
    await page.evaluate(()=>document.fonts.ready);
    await page.locator('#tab-nutrition').tap();
    await page.locator('#demo-image').evaluate(img=>img.decode());
    assert.equal(await page.locator('#tab-nutrition').getAttribute('aria-selected'),'true');
    assert((await page.locator('#demo-image').getAttribute('src')).startsWith('data:image/webp;base64,'));
    await page.locator('summary').nth(2).tap();
    assert(await page.locator('details').nth(2).evaluate(el=>el.open));
    await page.keyboard.press('Tab');
    await page.locator('.footer-links a[href="#launch"]').focus();
    assert.notEqual(await page.locator(':focus').evaluate(e=>getComputedStyle(e).outlineStyle),'none');
    await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>location.hash),'#launch');
    const narrowRendering=[];
    for(const width of [1440,390,320]){await page.setViewportSize({width,height:900});const layout=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth}));assert.equal(layout.width,layout.documentWidth);narrowRendering.push(layout);if(width===320){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(root,'verification/mobile-320.png')});}}
    await page.setViewportSize({width:390,height:844});
    const state=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length}));
    assert.equal(state.brokenImages,0);assert.equal(state.width,state.documentWidth);assert.equal(errors.length,0);assert.equal(requests.length,0);
    const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:844}});
    const fallback=await nojs.newPage();await fallback.route('**/*',r=>r.abort());
    await fallback.setContent(fs.readFileSync(path.join(root,'liftspire-preview.html'),'utf8'));
    assert(await fallback.locator('noscript').isVisible());
    assert.equal(await fallback.locator('noscript a').count(),2);
    await fallback.locator('summary').nth(1).click();
    assert(await fallback.locator('details').nth(1).getAttribute('open')!==null);
    await fallback.screenshot({path:path.join(root,'verification/no-js-320.png')});
    await nojs.close();
    const report={noJavaScriptFallback:true,mobileTouchTabs:true,mobileTouchFAQ:true,selfContained:true,releaseStatusKeyboard:true,narrowRendering,networkRequests:requests,pageErrors:errors,rendering:state};
    fs.writeFileSync(path.join(root,'verification/standalone-report.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify(report,null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
