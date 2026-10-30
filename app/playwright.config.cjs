const { defineConfig, devices } = require('@playwright/test');
const testPort = Number(process.env.TEMA_TEST_PORT || 4173);
module.exports = defineConfig({
  testDir: './tests/browser', fullyParallel: false, workers: 1, reporter: 'list',
  use: { baseURL: `http://127.0.0.1:${testPort}`, trace: 'off', screenshot: 'off', video: 'off' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }, { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } }, ...(process.env.TEMA_BROWSER_MATRIX === 'all' ? [{ name: 'firefox', use: { ...devices['Desktop Firefox'] } }, { name: 'webkit', use: { ...devices['Desktop Safari'] } }] : [])],
  webServer: { command: 'node scripts/serve.cjs', env: { PORT: String(testPort) }, url: `http://127.0.0.1:${testPort}`, reuseExistingServer: false, timeout: 10000 }
});
