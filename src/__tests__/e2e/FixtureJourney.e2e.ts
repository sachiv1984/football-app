// src/__tests__/e2e/FixtureJourney.e2e.ts
// End-to-end test using Playwright or Cypress

import { test, expect } from '@playwright/test';

test.describe('Football App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display fixtures on homepage', async ({ page }) => {
    // Wait for fixtures to load
    await page.waitForSelector('[data-testid="fixture-card"]');
    
    // Check that fixtures are displayed
    const fixtureCards = page.locator('[data-testid="fixture-card"]');
    expect(await fixtureCards.count()).toBeGreaterThan(0);
    
    // Check fixture content
    await expect(fixtureCards.first()).toContainText(/vs/);
  });

  test('should navigate to fixture details', async ({ page }) => {
    // Click on first fixture
    await page.click('[data-testid="fixture-card"]:first-child');
    
    // Should navigate to fixture detail page
    await expect(page).toHaveURL(/\/fixtures\/\d+/);
    
    // Should display fixture details
    await expect(page.locator('h1')).toContainText(/vs/);
  });

  test('should search for teams', async ({ page }) => {
    // Click search button
    await page.click('[aria-label="Search"]');
    
    // Type search query
    await page.fill('input[placeholder*="Search"]', 'Liverpool');
    
    // Wait for search results
    await page.waitForSelector('[data-testid="search-result"]');
    
    // Should display search results
    const results = page.locator('[data-testid="search-result"]');
    expect(await results.count()).toBeGreaterThan(0);
    await expect(results.first()).toContainText('Liverpool');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check mobile navigation
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    
    // Check that desktop navigation is hidden
    await expect(page.locator('[data-testid="desktop-nav"]')).toBeHidden();
    
    // Test mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });

  test('should work offline', async ({ page }) => {
    // Load page first
    await page.waitForSelector('[data-testid="fixture-card"]');
    
    // Go offline
    await page.context().setOffline(true);
    
    // Refresh page
    await page.reload();
    
    // Should still display cached content
    await expect(page.locator('[data-testid="fixture-card"]')).toBeVisible();
    
    // Should show offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
  });
});
