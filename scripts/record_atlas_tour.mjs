import puppeteer from 'file:///C:/Users/David/Documents/antigravity-proyects/create-videos-app/shared/tools/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputFile = path.join(__dirname, '..', 'taratic_human_atlas_master_tour_16x9.mp4');

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('=== STARTING 1080p SCREEN RECORDING TOUR OF ATLAS HUMANO 3D ===');

  const ffmpeg = spawn('ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', '25',
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-crf', '18',
    '-movflags', '+faststart',
    outputFile
  ]);

  ffmpeg.stderr.on('data', data => {
    // console.log(`[ffmpeg] ${data}`);
  });

  ffmpeg.on('close', code => {
    console.log(`[ffmpeg] closed with code ${code}`);
  });

  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: [
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--enable-webgl',
      '--window-size=1920,1080',
      '--no-sandbox',
      '--disable-infobars'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Navigating to http://localhost:3016/...');
  await page.goto('http://localhost:3016/', { waitUntil: 'networkidle0' });
  await sleep(4000); // Wait for full 3D chunk load

  const client = await page.target().createCDPSession();
  let frameCount = 0;

  client.on('Page.screencastFrame', async ({ data, sessionId }) => {
    try {
      const buffer = Buffer.from(data, 'base64');
      ffmpeg.stdin.write(buffer);
      frameCount++;
      await client.send('Page.screencastFrameAck', { sessionId });
    } catch (e) {
      // Ignore if closed
    }
  });

  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 92,
    maxWidth: 1920,
    maxHeight: 1080,
    everyNthFrame: 1
  });

  console.log('Screencast started. Recording scenes...');

  // Smooth mouse move helper
  async function smoothMouseMove(x1, y1, x2, y2, steps = 15) {
    for (let i = 0; i <= steps; i++) {
      const x = x1 + (x2 - x1) * (i / steps);
      const y = y1 + (y2 - y1) * (i / steps);
      await page.mouse.move(x, y);
      await sleep(15);
    }
  }

  // Smooth 3D orbit helper
  async function orbit3D(startX, startY, deltaX, deltaY, steps = 25) {
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    for (let i = 0; i <= steps; i++) {
      await page.mouse.move(startX + deltaX * (i / steps), startY + deltaY * (i / steps));
      await sleep(25);
    }
    await page.mouse.up();
    await sleep(400);
  }

  // Helper to safely click an element by text inside a selector
  async function clickByText(selector, text, waitAfter = 2000) {
    const elements = await page.$$(selector);
    for (const el of elements) {
      const content = await page.evaluate(e => e.textContent, el);
      if (content && content.toLowerCase().includes(text.toLowerCase())) {
        const box = await el.boundingBox();
        if (box) {
          await smoothMouseMove(960, 500, box.x + box.width / 2, box.y + box.height / 2);
          await sleep(150);
          await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
          await sleep(waitAfter);
          return true;
        }
      }
    }
    return false;
  }

  // 1. Initial 3D orbit
  console.log('Scene 1: Orbiting full 3D body...');
  await sleep(1500);
  await orbit3D(960, 500, 180, 0, 30);
  await sleep(1000);
  await orbit3D(1140, 500, -120, 0, 20);
  await sleep(1200);

  // 2. Presets demonstration
  console.log('Scene 2: Demonstrating layer presets...');
  console.log('  -> Clicking Esqueleto...');
  await clickByText('.layer-presets button', 'Esqueleto', 2500);

  console.log('  -> Clicking Músculos...');
  await clickByText('.layer-presets button', 'Músculos', 2500);

  console.log('  -> Clicking Órganos...');
  await clickByText('.layer-presets button', 'Órganos', 2500);

  console.log('  -> Clicking Circulatorio...');
  await clickByText('.layer-presets button', 'Circulatorio', 2500);

  console.log('  -> Clicking Nervioso...');
  await clickByText('.layer-presets button', 'Nervioso', 2500);

  console.log('  -> Clicking Todos los sistemas...');
  await clickByText('.layer-presets button', 'Todos', 2000);

  // 3. Clicks de ver y no ver (Ocultar todo, switches individuales, Mostrar todo)
  console.log('Scene 3: Demonstrating visibility clicks (Ver y no ver)...');
  const btnHideAll = await page.$('.foot-btn.foot-hide');
  if (btnHideAll) {
    const box = await btnHideAll.boundingBox();
    if (box) {
      await smoothMouseMove(500, 500, box.x + box.width / 2, box.y + box.height / 2);
      await sleep(200);
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      console.log('  -> Clicked Ocultar todo');
      await sleep(2000);
    }
  }

  // Toggle single system switch: Esquelético
  const switches = await page.$$('.system-row button[role="switch"]');
  if (switches.length > 0) {
    const box1 = await switches[0].boundingBox();
    if (box1) {
      await page.mouse.click(box1.x + box1.width / 2, box1.y + box1.height / 2);
      console.log('  -> Turned ON Esqueleto switch');
      await sleep(2000);
    }
  }

  // Toggle second switch (e.g. Muscular or Cardiac)
  if (switches.length > 2) {
    const box2 = await switches[2].boundingBox();
    if (box2) {
      await page.mouse.click(box2.x + box2.width / 2, box2.y + box2.height / 2);
      console.log('  -> Turned ON second system switch');
      await sleep(2000);
    }
  }

  // Click Mostrar todo
  const btnShowAll = await page.$('.foot-btn.foot-show');
  if (btnShowAll) {
    const box = await btnShowAll.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      console.log('  -> Clicked Mostrar todo');
      await sleep(2200);
    }
  }

  // 4. Despiece / Explode Slider
  console.log('Scene 4: Demonstrating Explode / Despiece slider...');
  const sliderTrack = await page.$('.right-hud-dock [role="slider"]');
  if (sliderTrack) {
    const box = await sliderTrack.boundingBox();
    if (box) {
      // Click at 75% of slider
      await smoothMouseMove(100, 800, box.x + box.width / 2, box.y - 45);
      await page.mouse.click(box.x + box.width / 2, box.y - 45);
      console.log('  -> Moved slider to 75% (exploded view)');
      await sleep(1500);
      await orbit3D(960, 500, 140, 0, 20);
      await sleep(1500);
      // Click at 0% of slider to restore
      await page.mouse.click(box.x + box.width / 2, box.y);
      console.log('  -> Restored slider to 0%');
      await sleep(1800);
    }
  }

  // 5. Search dock with 3D thumbnails
  console.log('Scene 5: Searching Corazón with real 3D thumbnails...');
  const searchInput = await page.$('.bottom-search-dock input');
  if (searchInput) {
    const box = await searchInput.boundingBox();
    if (box) {
      await smoothMouseMove(960, 500, box.x + 100, box.y + box.height / 2);
      await page.mouse.click(box.x + 100, box.y + box.height / 2);
      await sleep(400);
      await page.keyboard.type('corazon', { delay: 120 });
      await sleep(2500); // Allow thumbnails to render

      // Click on Corazón result
      const searchRows = await page.$$('.search-result-row');
      for (const row of searchRows) {
        const text = await page.evaluate(e => e.textContent, row);
        if (text && (text.includes('Corazón') || text.includes('heart'))) {
          const rowBox = await row.boundingBox();
          if (rowBox) {
            await page.mouse.click(rowBox.x + rowBox.width / 2, rowBox.y + rowBox.height / 2);
            console.log('  -> Clicked Corazón search result');
            await sleep(2500);
            break;
          }
        }
      }
    }
  }

  // 6. Detail panel, Anatomical Connectivity & 3D isolation
  console.log('Scene 6: Inspecting Anatomical Connectivity & 3D isolation...');
  await sleep(1000);

  // Scroll detail panel down to reveal connectivity section
  await page.evaluate(() => {
    const detailBody = document.querySelector('.detail-body');
    if (detailBody) {
      detailBody.scrollTop = 380;
    }
  });
  await sleep(1800);

  // Click 3D toggle buttons on connected items
  const conn3DBtns = await page.$$('.conn-3d-toggle-btn');
  if (conn3DBtns.length >= 2) {
    const b1 = await conn3DBtns[0].boundingBox();
    if (b1) {
      await page.mouse.click(b1.x + b1.width / 2, b1.y + b1.height / 2);
      console.log('  -> Toggled 3D connected piece 1');
      await sleep(1500);
    }
    const b2 = await conn3DBtns[1].boundingBox();
    if (b2) {
      await page.mouse.click(b2.x + b2.width / 2, b2.y + b2.height / 2);
      console.log('  -> Toggled 3D connected piece 2');
      await sleep(1500);
    }
  }

  // Orbit isolated cluster in 3D scene
  await orbit3D(960, 500, 100, 0, 20);
  await sleep(1500);

  // Click Aislar estructura
  const btnIsolate = await page.$('.primary-action');
  if (btnIsolate) {
    const box = await btnIsolate.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      console.log('  -> Clicked Aislar estructura');
      await sleep(2500);
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2); // Restore
      console.log('  -> Restored surrounding environment');
      await sleep(1800);
    }
  }

  // 7. Dark Mode Demonstration
  console.log('Scene 7: Toggling Dark Mode...');
  const headerBtns = await page.$$('header button, .top-header button');
  for (const btn of headerBtns) {
    const hasMoon = await page.evaluate(b => !!b.querySelector('svg.lucide-moon'), btn);
    if (hasMoon) {
      const box = await btn.boundingBox();
      if (box) {
        await smoothMouseMove(960, 500, box.x + box.width / 2, box.y + box.height / 2);
        await sleep(200);
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        console.log('  -> Switched to Dark Theme');
        await sleep(3000);
        break;
      }
    }
  }

  // Orbit in Dark Mode
  await orbit3D(960, 500, 150, 0, 25);
  await sleep(2500);

  console.log(`Stopping screencast... Total recorded frames: ${frameCount}`);
  await client.send('Page.stopScreencast');
  await browser.close();

  ffmpeg.stdin.end();

  await new Promise(resolve => {
    ffmpeg.on('close', resolve);
  });

  console.log(`=== MASTER TOUR VIDEO CREATED SUCCESSFULLY: ${outputFile} ===`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
