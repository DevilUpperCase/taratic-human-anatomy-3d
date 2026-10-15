import puppeteer from 'file:///C:/Users/David/Documents/antigravity-proyects/create-videos-app/shared/tools/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import { spawn, execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rawVideoFile = path.join(__dirname, '..', 'taratic_human_atlas_raw.mp4');
const masterOutputFile = path.join(__dirname, '..', 'taratic_human_atlas_master_tour_16x9.mp4');
const musicFile = 'C:/Users/David/Documents/antigravity-proyects/create-videos-app/assets/audio/music/orchestral/cinematic_dark_deliverance.mp3';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('=== STARTING 1080p SCREEN RECORDING TOUR (DARK MODE + BIG CURSOR) ===');

  if (fs.existsSync(rawVideoFile)) {
    try { fs.unlinkSync(rawVideoFile); } catch {}
  }

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
    rawVideoFile
  ]);

  ffmpeg.stderr.on('data', () => {});
  ffmpeg.on('close', code => {
    console.log(`[ffmpeg raw] closed with code ${code}`);
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

  // Ensure default dark mode in page
  await page.evaluate(() => {
    sessionStorage.setItem('human_atlas_theme', 'dark');
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  });

  await sleep(4000); // Wait for full 3D chunk load

  // Inject Big Visible Presentation Cursor & Click Ripple Animation
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.id = 'cursor-presentation-styles';
    style.textContent = `
      #virtual-cursor {
        position: fixed;
        top: 0;
        left: 0;
        width: 44px;
        height: 44px;
        pointer-events: none;
        z-index: 2147483647;
        transform: translate(960px, 500px);
        transition: transform 0.02s linear;
        filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.85));
      }
      #virtual-cursor svg {
        display: block;
        width: 44px;
        height: 44px;
      }
      .cursor-click-wave {
        position: fixed;
        width: 76px;
        height: 76px;
        margin-left: -38px;
        margin-top: -38px;
        border-radius: 50%;
        border: 4px solid #00f0ff;
        background: radial-gradient(circle, rgba(0, 240, 255, 0.6) 0%, rgba(0, 240, 255, 0.15) 55%, transparent 75%);
        pointer-events: none;
        z-index: 2147483646;
        transform: scale(0.15);
        opacity: 1;
        animation: clickWaveAnim 0.55s cubic-bezier(0.1, 0.85, 0.25, 1) forwards;
      }
      @keyframes clickWaveAnim {
        0% {
          transform: scale(0.15);
          opacity: 1;
        }
        60% {
          opacity: 0.9;
        }
        100% {
          transform: scale(1.75);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    const cursor = document.createElement('div');
    cursor.id = 'virtual-cursor';
    cursor.innerHTML = `
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Heavy dark outer outline for contrast over bright textures -->
        <path d="M4 2L13.5 25.5L17.5 17.5L25.5 13.5L4 2Z" fill="#000000" stroke="#000000" stroke-width="4.5" stroke-linejoin="round"/>
        <!-- Inner bright fill with vibrant electric cyan & white border -->
        <path d="M4 2L13.5 25.5L17.5 17.5L25.5 13.5L4 2Z" fill="#00e5ff" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
        <!-- Hotspot center light dot -->
        <circle cx="5" cy="3.5" r="2.5" fill="#ffffff"/>
      </svg>
    `;
    document.body.appendChild(cursor);

    window.__cursorX = 960;
    window.__cursorY = 500;

    window.__moveCursor = (x, y) => {
      window.__cursorX = x;
      window.__cursorY = y;
      cursor.style.transform = `translate(${x}px, ${y}px)`;
    };

    window.__clickCursor = (x, y) => {
      window.__moveCursor(x, y);
      const wave = document.createElement('div');
      wave.className = 'cursor-click-wave';
      wave.style.left = `${x}px`;
      wave.style.top = `${y}px`;
      document.body.appendChild(wave);
      setTimeout(() => wave.remove(), 600);
    };

    window.addEventListener('mousemove', e => {
      window.__moveCursor(e.clientX, e.clientY);
    });

    window.addEventListener('mousedown', e => {
      window.__clickCursor(e.clientX, e.clientY);
    });
  });

  const client = await page.target().createCDPSession();
  let frameCount = 0;

  client.on('Page.screencastFrame', async ({ data, sessionId }) => {
    try {
      const buffer = Buffer.from(data, 'base64');
      ffmpeg.stdin.write(buffer);
      frameCount++;
      await client.send('Page.screencastFrameAck', { sessionId });
    } catch (e) {}
  });

  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 92,
    maxWidth: 1920,
    maxHeight: 1080,
    everyNthFrame: 1
  });

  console.log('Screencast started. Recording scenes with big cursor...');

  let curX = 960;
  let curY = 500;

  // Smooth mouse move with cubic easing and cursor update
  async function smoothMouseMove(x1, y1, x2, y2, steps = 18) {
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const x = Math.round(x1 + (x2 - x1) * ease);
      const y = Math.round(y1 + (y2 - y1) * ease);
      await page.evaluate((cx, cy) => window.__moveCursor(cx, cy), x, y);
      await page.mouse.move(x, y);
      await sleep(14);
    }
    curX = x2;
    curY = y2;
  }

  // Animated click with visible cursor dwell and ripple wave
  async function animatedClick(targetX, targetY, waitAfter = 1800) {
    await smoothMouseMove(curX, curY, targetX, targetY);
    await sleep(200); // Visual dwell so viewer sees cursor on the button
    await page.evaluate((cx, cy) => window.__clickCursor(cx, cy), targetX, targetY);
    await page.mouse.click(targetX, targetY);
    await sleep(waitAfter);
  }

  // Smooth 3D orbit helper
  async function orbit3D(startX, startY, deltaX, deltaY, steps = 25) {
    await smoothMouseMove(curX, curY, startX, startY);
    await page.mouse.down();
    for (let i = 0; i <= steps; i++) {
      const x = Math.round(startX + deltaX * (i / steps));
      const y = Math.round(startY + deltaY * (i / steps));
      await page.evaluate((cx, cy) => window.__moveCursor(cx, cy), x, y);
      await page.mouse.move(x, y);
      await sleep(25);
    }
    curX = startX + deltaX;
    curY = startY + deltaY;
    await page.mouse.up();
    await sleep(400);
  }

  // Click element by text with big cursor
  async function clickByText(selector, text, waitAfter = 2000) {
    const elements = await page.$$(selector);
    for (const el of elements) {
      const content = await page.evaluate(e => e.textContent, el);
      if (content && content.toLowerCase().includes(text.toLowerCase())) {
        const box = await el.boundingBox();
        if (box) {
          const tx = Math.round(box.x + box.width / 2);
          const ty = Math.round(box.y + box.height / 2);
          await animatedClick(tx, ty, waitAfter);
          return true;
        }
      }
    }
    return false;
  }

  // 1. Scene 1: Initial 3D Orbit in Default Dark Mode
  console.log('Scene 1: Orbiting full 3D body in Default Dark Mode...');
  await sleep(1500);
  await orbit3D(960, 500, 180, 0, 30);
  await sleep(800);
  await orbit3D(1140, 500, -120, 0, 20);
  await sleep(1000);

  // 2. Scene 2: Layer Presets Demonstration
  console.log('Scene 2: Demonstrating layer presets with big cursor...');
  console.log('  -> Clicking Esqueleto...');
  await clickByText('.layer-presets button', 'Esqueleto', 2200);

  console.log('  -> Clicking Músculos...');
  await clickByText('.layer-presets button', 'Músculos', 2200);

  console.log('  -> Clicking Órganos...');
  await clickByText('.layer-presets button', 'Órganos', 2200);

  console.log('  -> Clicking Circulatorio...');
  await clickByText('.layer-presets button', 'Circulatorio', 2200);

  console.log('  -> Clicking Nervioso...');
  await clickByText('.layer-presets button', 'Nervioso', 2200);

  console.log('  -> Clicking Todos...');
  await clickByText('.layer-presets button', 'Todos', 2000);

  // 3. Scene 3: Visibility clicks ("Ver y No Ver")
  console.log('Scene 3: Demonstrating visibility toggles (Ver y no ver)...');
  const btnHideAll = await page.$('.foot-btn.foot-hide');
  if (btnHideAll) {
    const box = await btnHideAll.boundingBox();
    if (box) {
      await animatedClick(Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2), 2000);
      console.log('  -> Clicked Ocultar todo');
    }
  }

  // Toggle single system switch: Esquelético
  const switches = await page.$$('.system-row button[role="switch"]');
  if (switches.length > 0) {
    const box1 = await switches[0].boundingBox();
    if (box1) {
      await animatedClick(Math.round(box1.x + box1.width / 2), Math.round(box1.y + box1.height / 2), 1800);
      console.log('  -> Turned ON Esqueleto switch');
    }
  }

  // Toggle second switch (Muscular or Cardiac)
  if (switches.length > 2) {
    const box2 = await switches[2].boundingBox();
    if (box2) {
      await animatedClick(Math.round(box2.x + box2.width / 2), Math.round(box2.y + box2.height / 2), 1800);
      console.log('  -> Turned ON second system switch');
    }
  }

  // Click Mostrar todo
  const btnShowAll = await page.$('.foot-btn.foot-show');
  if (btnShowAll) {
    const box = await btnShowAll.boundingBox();
    if (box) {
      await animatedClick(Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2), 2200);
      console.log('  -> Clicked Mostrar todo');
    }
  }

  // 4. Scene 4: Despiece / Explode Slider
  console.log('Scene 4: Demonstrating Explode / Despiece slider...');
  const sliderTrack = await page.$('.right-hud-dock [role="slider"]');
  if (sliderTrack) {
    const box = await sliderTrack.boundingBox();
    if (box) {
      // Click at 75% of slider
      const targetX = Math.round(box.x + box.width / 2);
      const targetY = Math.round(box.y - 45);
      await animatedClick(targetX, targetY, 1500);
      console.log('  -> Moved slider to 75% (exploded view)');

      await orbit3D(960, 500, 140, 0, 20);
      await sleep(1200);

      // Click at 0% of slider to restore
      await animatedClick(targetX, Math.round(box.y), 1800);
      console.log('  -> Restored slider to 0%');
    }
  }

  // 5. Scene 5: Search dock with 3D thumbnails
  console.log('Scene 5: Searching Corazón with real 3D thumbnails...');
  const searchInput = await page.$('.bottom-search-dock input');
  if (searchInput) {
    const box = await searchInput.boundingBox();
    if (box) {
      await animatedClick(Math.round(box.x + 100), Math.round(box.y + box.height / 2), 500);
      await page.keyboard.type('corazon', { delay: 120 });
      await sleep(2500); // Allow thumbnails to render

      // Click on Corazón result
      const searchRows = await page.$$('.search-result-row');
      for (const row of searchRows) {
        const text = await page.evaluate(e => e.textContent, row);
        if (text && (text.includes('Corazón') || text.includes('heart'))) {
          const rowBox = await row.boundingBox();
          if (rowBox) {
            await animatedClick(Math.round(rowBox.x + rowBox.width / 2), Math.round(rowBox.y + rowBox.height / 2), 2500);
            console.log('  -> Clicked Corazón search result');
            break;
          }
        }
      }
    }
  }

  // 6. Scene 6: Detail panel, Anatomical Connectivity & 3D isolation
  console.log('Scene 6: Inspecting Anatomical Connectivity & 3D isolation...');
  await sleep(1000);

  // Scroll detail panel down to reveal connectivity section
  await page.evaluate(() => {
    const detailBody = document.querySelector('.detail-body');
    if (detailBody) {
      detailBody.scrollTop = 380;
    }
  });
  await sleep(1500);

  // Click 3D toggle buttons on connected items
  const conn3DBtns = await page.$$('.conn-3d-toggle-btn');
  if (conn3DBtns.length >= 2) {
    const b1 = await conn3DBtns[0].boundingBox();
    if (b1) {
      await animatedClick(Math.round(b1.x + b1.width / 2), Math.round(b1.y + b1.height / 2), 1500);
      console.log('  -> Toggled 3D connected piece 1');
    }
    const b2 = await conn3DBtns[1].boundingBox();
    if (b2) {
      await animatedClick(Math.round(b2.x + b2.width / 2), Math.round(b2.y + b2.height / 2), 1500);
      console.log('  -> Toggled 3D connected piece 2');
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
      await animatedClick(Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2), 2500);
      console.log('  -> Clicked Aislar estructura');
      await animatedClick(Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2), 1800);
      console.log('  -> Restored surrounding environment');
    }
  }

  // 7. Scene 7: Final Panoramic Orbit in Dark Mode
  console.log('Scene 7: Final cinematic orbit in dark mode...');
  await orbit3D(960, 500, 160, 0, 25);
  await sleep(2000);

  console.log(`Stopping screencast... Total recorded frames: ${frameCount}`);
  await client.send('Page.stopScreencast');
  await browser.close();

  ffmpeg.stdin.end();

  await new Promise(resolve => {
    ffmpeg.on('close', resolve);
  });

  console.log(`Raw video created: ${rawVideoFile}`);

  // Mux audio soundtrack
  console.log('Muxing soundtrack with audio ducking and smooth fades...');
  try {
    const durationCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${rawVideoFile}"`;
    const durRaw = execSync(durationCmd, { encoding: 'utf-8' }).trim();
    const duration = parseFloat(durRaw) || 50.0;
    const fadeOutStart = Math.max(0, duration - 3.0);

    const muxCmd = `ffmpeg -y -i "${rawVideoFile}" -i "${musicFile}" -filter_complex "[1:a]volume=0.22,afade=t=in:st=0:d=1.5,afade=t=out:st=${fadeOutStart.toFixed(2)}:d=3.0[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest "${masterOutputFile}"`;
    console.log(`Executing: ${muxCmd}`);
    execSync(muxCmd, { stdio: 'inherit' });
    console.log(`=== MASTER TOUR VIDEO PRODUCED: ${masterOutputFile} ===`);
  } catch (err) {
    console.error('Error muxing audio:', err);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
