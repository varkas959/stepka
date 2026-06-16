import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { slug } = req.query;
  if (!slug || !/^[a-z0-9]{6,12}$/.test(slug)) {
    return res.status(400).json({ error: 'Invalid slug' });
  }

  const { data, error } = await supabase
    .from('readiness_reports')
    .select('id, slug, company, role, readiness, heatmap, gaps, summary, prep_weeks, created_at')
    .eq('slug', slug)
    .eq('is_public', true)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Report not found' });

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  return res.status(200).json(data);
}