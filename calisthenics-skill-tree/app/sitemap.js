import { SITE_URL } from './site';
import { exercises as builtInExercises } from './exercises-data';

export default function sitemap() {
  const now = new Date();

  const staticRoutes = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/tree', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/exercises', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/login', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/signup', priority: 0.5, changeFrequency: 'yearly' },
  ].map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Built-in exercise pages (the primary SEO targets).
  const exerciseRoutes = builtInExercises.map((ex) => ({
    url: `${SITE_URL}/exercises/${ex.id}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...exerciseRoutes];
}
