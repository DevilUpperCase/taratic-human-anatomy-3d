import puppeteer from 'file:///C:/Users/David/Documents/antigravity-proyects/create-videos-app/shared/tools/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '..', 'docs', 'screenshots');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('=== CAPTURING 8 PERFECT HD SCREENSHOTS FOR README.MD ===');

  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: [
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--enable-webgl',
      '--window-size=1920,1080',
      '--no-sandbox',
      '--disable-infobars',
      '--force-device-scale-factor=1'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Navigating to http://localhost:3016/...');
  await page.goto('http://localhost:3016/', { waitUntil: 'networkidle0' });

  // Start in Dark Mode
  await page.evaluate(() => {
    sessionStorage.setItem('human_atlas_theme', 'dark');
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  });

  console.log('Waiting for initial 3D models and geometry to hydrate...');
  await sleep(4500);

  // Helper to click by text
  async function clickByText(selector, text, waitAfter = 1800) {
    const elements = await page.$$(selector);
    for (const el of elements) {
      const content = await page.evaluate(e => e.textContent, el);
      if (content && content.toLowerCase().includes(text.toLowerCase())) {
        await el.click();
        await sleep(waitAfter);
        return true;
      }
    }
    return false;
  }

  // Smooth 3D orbit helper
  async function orbit3D(startX, startY, deltaX, deltaY, steps = 20) {
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    for (let i = 0; i <= steps; i++) {
      const x = Math.round(startX + deltaX * (i / steps));
      const y = Math.round(startY + deltaY * (i / steps));
      await page.mouse.move(x, y);
      await sleep(20);
    }
    await page.mouse.up();
    await sleep(400);
  }

  // 1. Screenshot 1: Full Body Dark Mode Overview
  console.log('Capturing 01_full_body_dark_mode.png...');
  await orbit3D(960, 500, 60, 0, 15);
  await sleep(1000);
  await page.screenshot({
    path: path.join(outputDir, '01_full_body_dark_mode.png'),
    type: 'png'
  });
  console.log('  -> Saved 01_full_body_dark_mode.png');

  // 2. Screenshot 2: Light Mode Full Body (Clinical View)
  console.log('Capturing 02_light_mode_clinical.png...');
  const themeToggle = await page.$('.theme-toggle-btn');
  if (themeToggle) {
    await themeToggle.click();
    await sleep(1500);
    await page.screenshot({
      path: path.join(outputDir, '02_light_mode_clinical.png'),
      type: 'png'
    });
    console.log('  -> Saved 02_light_mode_clinical.png');
    // Switch back to dark mode
    await themeToggle.click();
    await sleep(1500);
  }

  // 3. Screenshot 3: Skeleton Layer Preset
  console.log('Capturing 03_skeleton_preset.png...');
  await clickByText('.layer-presets button', 'Esqueleto', 2500);
  await orbit3D(960, 500, -35, 0, 15);
  await sleep(1000);
  await page.screenshot({
    path: path.join(outputDir, '03_skeleton_preset.png'),
    type: 'png'
  });
  console.log('  -> Saved 03_skeleton_preset.png');

  // 4. Screenshot 4: Muscular Layer Preset
  console.log('Capturing 04_muscles_preset.png...');
  await clickByText('.layer-presets button', 'Músculos', 2500);
  await orbit3D(960, 500, 50, 0, 15);
  await sleep(1000);
  await page.screenshot({
    path: path.join(outputDir, '04_muscles_preset.png'),
    type: 'png'
  });
  console.log('  -> Saved 04_muscles_preset.png');

  // 5. Screenshot 5: Organs & Circulatory Presets
  console.log('Capturing 05_organs_circulatory_preset.png...');
  await clickByText('.layer-presets button', 'Órganos', 2500);
  await clickByText('.layer-presets button', 'Circulatorio', 2500);
  await orbit3D(960, 500, -40, 0, 15);
  await sleep(1000);
  await page.screenshot({
    path: path.join(outputDir, '05_organs_circulatory_preset.png'),
    type: 'png'
  });
  console.log('  -> Saved 05_organs_circulatory_preset.png');

  // Restore Todos preset
  await clickByText('.layer-presets button', 'Todos', 2500);

  // 6. Screenshot 6: Exploded 3D View (Despiece)
  console.log('Capturing 06_exploded_view_spatial.png...');
  const sliderThumb = await page.$('[data-slot="slider-thumb"]');
  if (sliderThumb) {
    const box = await sliderThumb.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      // Drag upwards by 110px
      for (let i = 0; i <= 10; i++) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - (110 * i / 10));
        await sleep(30);
      }
      await page.mouse.up();
      await sleep(1800);

      await orbit3D(960, 500, 75, 0, 15);
      await sleep(1200);
      await page.screenshot({
        path: path.join(outputDir, '06_exploded_view_spatial.png'),
        type: 'png'
      });
      console.log('  -> Saved 06_exploded_view_spatial.png');

      // Click explode reset button
      const resetExplodeBtn = await page.$('.hud-explode-reset');
      if (resetExplodeBtn) {
        await resetExplodeBtn.click();
        await sleep(1500);
      }
    }
  }

  // 7. Screenshot 7: Predictive Search with 3D Thumbnails
  console.log('Capturing 07_search_predictive_3d_thumbnails.png...');
  const searchInput = await page.$('.bottom-search-dock input');
  if (searchInput) {
    await searchInput.click();
    await page.keyboard.type('corazon', { delay: 100 });
    await sleep(3200); // Allow 3D canvas thumbnails to render
    await page.screenshot({
      path: path.join(outputDir, '07_search_predictive_3d_thumbnails.png'),
      type: 'png'
    });
    console.log('  -> Saved 07_search_predictive_3d_thumbnails.png');

    // Select Corazón
    const searchRows = await page.$$('.search-result-row');
    for (const row of searchRows) {
      const text = await page.evaluate(e => e.textContent, row);
      if (text && (text.includes('Corazón') || text.includes('heart'))) {
        await row.click();
        console.log('  -> Selected Corazón');
        await sleep(3500);
        break;
      }
    }
  }

  // 8. Screenshot 8: Detail Panel, Biomechanics & Anatomical Connectivity
  console.log('Capturing 08_organ_inspection_connectivity.png...');
  await page.evaluate(() => {
    const detailBody = document.querySelector('.detail-body');
    if (detailBody) detailBody.scrollTop = 380;
  });
  await sleep(1200);

  // Toggle 3D buttons on connected items
  const conn3DBtns = await page.$$('.conn-3d-toggle-btn');
  if (conn3DBtns.length >= 2) {
    await conn3DBtns[0].click();
    await sleep(1000);
    await conn3DBtns[1].click();
    await sleep(1200);
  }

  await orbit3D(960, 500, 40, 0, 15);
  await sleep(1200);
  await page.screenshot({
    path: path.join(outputDir, '08_organ_inspection_connectivity.png'),
    type: 'png'
  });
  console.log('  -> Saved 08_organ_inspection_connectivity.png');

  await browser.close();
  console.log('=== ALL 8 PERFECT HD SCREENSHOTS CAPTURED SUCCESSFULLY ===');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
