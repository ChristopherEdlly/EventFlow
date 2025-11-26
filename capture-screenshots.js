const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'UI-UX-Analysis', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const baseUrl = 'http://localhost:3002';

  console.log('🚀 Starting screenshot capture...\n');

  // 1. Login Page (sem autenticação)
  console.log('📸 Capturing LoginPage...');
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(screenshotsDir, '01-LoginPage.png'),
    fullPage: true
  });
  console.log('✅ LoginPage captured\n');

  // 2. Register Page (sem autenticação)
  console.log('📸 Capturing RegisterPage...');
  await page.goto(`${baseUrl}/register`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(screenshotsDir, '02-RegisterPage.png'),
    fullPage: true
  });
  console.log('✅ RegisterPage captured\n');

  // Tentar fazer login para capturar páginas autenticadas
  console.log('🔐 Attempting to register and login...');
  await page.goto(`${baseUrl}/register`);
  await page.waitForTimeout(500);

  // Preencher formulário de registro
  try {
    await page.fill('input[placeholder="Seu nome completo"]', 'Screenshot User');
    await page.fill('input[type="email"]', 'screenshot@test.com');
    await page.fill('input[placeholder="Mínimo 6 caracteres"]', 'Test123!');
    await page.fill('input[placeholder="Repita sua senha"]', 'Test123!');
    await page.click('button[type="submit"]');

    // Aguardar navegação após registro (deve redirecionar para home)
    await page.waitForTimeout(2500);
  } catch (err) {
    // Se já existir usuário, fazer login
    console.log('ℹ️  User may already exist, trying login...');
    await page.goto(`${baseUrl}/login`);
    await page.waitForTimeout(500);
    await page.fill('input[type="email"]', 'screenshot@test.com');
    await page.fill('input[type="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  }

  const currentUrl = page.url();
  const isLoggedIn = !currentUrl.includes('/login');

  if (isLoggedIn) {
    console.log('✅ Login successful!\n');

    // 3. HomePage (Dashboard)
    console.log('📸 Capturing HomePage...');
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, '03-HomePage.png'),
      fullPage: true
    });
    console.log('✅ HomePage captured\n');

    // 4. MyEventsPage
    console.log('📸 Capturing MyEventsPage...');
    await page.goto(`${baseUrl}/myEvents`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, '04-MyEventsPage.png'),
      fullPage: true
    });
    console.log('✅ MyEventsPage captured\n');

    // 5. NewEventPage
    console.log('📸 Capturing NewEventPage...');
    await page.goto(`${baseUrl}/newEvent`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, '05-NewEventPage.png'),
      fullPage: true
    });
    console.log('✅ NewEventPage captured\n');

    // 6. EventDetailsPage (se houver eventos)
    console.log('📸 Attempting to capture EventDetailsPage...');
    try {
      // Primeiro, pegar ID de um evento
      await page.goto(`${baseUrl}/myEvents`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // Tentar clicar no primeiro card de evento
      const eventCard = await page.$('.cursor-pointer[class*="gradient"]');
      if (eventCard) {
        await eventCard.click();
        await page.waitForTimeout(1500);
        await page.screenshot({
          path: path.join(screenshotsDir, '06-EventDetailsPage.png'),
          fullPage: true
        });
        console.log('✅ EventDetailsPage captured\n');
      } else {
        console.log('⚠️  No events found, skipping EventDetailsPage\n');
      }
    } catch (err) {
      console.log('⚠️  Could not capture EventDetailsPage:', err.message, '\n');
    }

    // 7. Profile/Settings (se existir)
    console.log('📸 Attempting to capture ProfilePage...');
    try {
      await page.goto(`${baseUrl}/profile`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(screenshotsDir, '07-ProfilePage.png'),
        fullPage: true
      });
      console.log('✅ ProfilePage captured\n');
    } catch (err) {
      console.log('⚠️  ProfilePage not accessible\n');
    }

  } else {
    console.log('❌ Login failed - could not capture authenticated pages\n');
    console.log('💡 Tip: Make sure backend is running and credentials are correct\n');
  }

  await browser.close();

  console.log('✨ Screenshot capture complete!');
  console.log(`📁 Screenshots saved to: ${screenshotsDir}`);
}

captureScreenshots().catch(err => {
  console.error('❌ Error capturing screenshots:', err);
  process.exit(1);
});
