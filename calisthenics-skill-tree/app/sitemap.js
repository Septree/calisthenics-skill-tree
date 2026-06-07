import { SITE_URL } from './site';
import { supabaseStatic } from './supabase/static';

export const revalidate = 3600;

export default async function sitemap() {
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

  const { data } = await supabaseStatic.from('exercises').select('id');
  const exerciseRoutes = (data || []).map((r) => ({
    url: `${SITE_URL}/exercises/${r.id}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...exerciseRoutes];
}
