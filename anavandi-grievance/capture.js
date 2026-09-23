import puppeteer from 'puppeteer';
import path from 'path';

const outDir = '/home/itsbro/.gemini/antigravity-ide/brain/460f5031-c16b-42e6-9393-65888aba57e2/';

const paths = [
  { name: 'landing', path: '/' },
  { name: 'report', path: '/report' },
  { name: 'track', path: '/track' },
  { name: 'depot_overview', path: '/console/depot' },
  { name: 'depot_inbox', path: '/console/depot/inbox' },
  { name: 'depot_case', path: '/console/depot/case/GRV-2026-000001' }
];

const viewports = [
  { name: 'mobile', width: 360, height: 800 },
  { name: 'desktop', width: 1440, height: 900 }
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.error('PAGE ERROR:', err.message);
    process.exit(1);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('CONSOLE ERROR:', msg.text());
      process.exit(1);
    }
  });
  
  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height });
    
    for (const route of paths) {
      await page.goto(`http://localhost:5173${route.path}`, { waitUntil: 'networkidle2' });
      // wait a bit for react rendering and data loading
      await new Promise(r => setTimeout(r, 1000));
      const filename = path.join(outDir, `${route.name}_${vp.name}.png`);
      await page.screenshot({ path: filename, fullPage: true });
      console.log(`Saved screenshot: ${filename}`);
    }
  }

  await browser.close();
})();
