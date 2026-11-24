import { describe, expect, test } from 'bun:test';
import { renderRobots } from './sitemap-plugin.js';

describe('article sitemap discovery', () => {
  test('adds a tenant-origin article sitemap only for CMS sites', () => {
    const origin = 'https://shop.example.com';
    expect(renderRobots(origin, '/', true)).toContain('Sitemap: https://shop.example.com/articles/sitemap.xml');
    expect(renderRobots(origin, '/', false)).not.toContain('/articles/sitemap.xml');
    expect(renderRobots(null, '/', true)).not.toContain('Sitemap:');
  });
});
