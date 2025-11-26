const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureMainPages() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const screenshotsDir = path.join(__dirname, 'UI-UX-Analysis', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const baseUrl = 'http://localhost:3002';

  console.log('🚀 Capturando páginas principais do EventFlow...\n');

  try {
    // 1. Fazer login
    console.log('🔐 Fazendo login...');
    await page.goto(`${baseUrl}/login`);
    await page.waitForTimeout(1000);

    await page.fill('input[type="email"]', 'test@eventflow.com');
    await page.fill('input[type="password"]', 'Test123!');
    await page.click('button[type="submit"]');

    // Aguardar redirecionamento
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('❌ Login falhou. Verificar credenciais.');
      await browser.close();
      return;
    }

    console.log('✅ Login bem-sucedido!\n');

    // 2. Dashboard/HomePage
    console.log('📸 Capturando Dashboard (HomePage)...');
    await page.goto(`${baseUrl}/`);
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(screenshotsDir, '03-Dashboard-HomePage.png'),
      fullPage: true
    });
    console.log('✅ Dashboard captured\n');

    // 3. Meus Eventos
    console.log('📸 Capturando Meus Eventos...');
    await page.goto(`${baseUrl}/my-events`);
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(screenshotsDir, '04-MyEventsPage.png'),
      fullPage: true
    });
    console.log('✅ Meus Eventos captured\n');

    // 4. Novo Evento
    console.log('📸 Capturando Novo Evento...');
    await page.goto(`${baseUrl}/new-event`);
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(screenshotsDir, '05-NewEventPage.png'),
      fullPage: true
    });
    console.log('✅ Novo Evento captured\n');

    // 5. Eventos Públicos
    console.log('📸 Capturando Eventos Públicos...');
    await page.goto(`${baseUrl}/public-events`);
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(screenshotsDir, '06-PublicEventsPage.png'),
      fullPage: true
    });
    console.log('✅ Eventos Públicos captured\n');

    // 6. Convites
    console.log('📸 Capturando Meus Convites...');
    await page.goto(`${baseUrl}/my-invites`);
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(screenshotsDir, '07-MyInvitesPage.png'),
      fullPage: true
    });
    console.log('✅ Convites captured\n');

    // 7. Histórico
    console.log('📸 Capturando Histórico...');
    await page.goto(`${baseUrl}/history`);
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(screenshotsDir, '08-HistoryPage.png'),
      fullPage: true
    });
    console.log('✅ Histórico captured\n');

    // 8. Perfil
    console.log('📸 Capturando Perfil...');
    await page.goto(`${baseUrl}/profile`);
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(screenshotsDir, '09-ProfilePage.png'),
      fullPage: true
    });
    console.log('✅ Perfil captured\n');

    // 9. Configurações
    console.log('📸 Capturando Configurações...');
    await page.goto(`${baseUrl}/settings`);
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(screenshotsDir, '10-SettingsPage.png'),
      fullPage: true
    });
    console.log('✅ Configurações captured\n');

    // 10. Detalhes do Evento (se houver eventos)
    console.log('📸 Tentando capturar Detalhes do Evento...');
    try {
      await page.goto(`${baseUrl}/my-events`);
      await page.waitForTimeout(1500);

      // Procurar primeiro card de evento
      const eventCard = await page.$('.cursor-pointer');
      if (eventCard) {
        await eventCard.click();
        await page.waitForTimeout(2000);
        await page.screenshot({
          path: path.join(screenshotsDir, '11-EventDetailsPage.png'),
          fullPage: true
        });
        console.log('✅ Detalhes do Evento captured\n');
      } else {
        console.log('ℹ️  Nenhum evento encontrado para capturar detalhes\n');
      }
    } catch (err) {
      console.log('⚠️  Não foi possível capturar Detalhes do Evento\n');
    }

  } catch (error) {
    console.error('❌ Erro durante captura:', error.message);
  } finally {
    await browser.close();
    console.log('\n✨ Captura concluída!');
    console.log(`📁 Screenshots salvos em: ${screenshotsDir}`);
  }
}

captureMainPages();
