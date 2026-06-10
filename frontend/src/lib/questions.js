// Supabase-backed user-submitted questions
import { supabase } from './supabaseClient';

export async function loadUserQuestions() {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[questions] load failed:', error.message);
    return [];
  }

  return data.map(row => ({
    id: row.id,
    company: row.company,
    role: row.role,
    topic: row.topic,
    topicPath: row.topic_path,
    difficulty: row.difficulty,
    round: row.round,
    body: row.body,
    tech: row.tech || [],
    upvotes: row.upvotes ?? 0,
    asked: row.asked ?? 1,
    verifyCount: row.verify_count ?? 1,
    daysAgo: row.days_ago ?? 0,
    isUserSubmitted: true,
  }));
}

export async function saveUserQuestion(q, userId) {
  const { data, error } = await supabase
    .from('questions')
    .insert({
      id: q.id,
      company: q.company,
      role: q.role,
      topic: q.topic,
      topic_path: q.topicPath,
      difficulty: q.difficulty,
      round: q.round,
      body: q.body,
      tech: q.tech || [],
      upvotes: 0,
      asked: 1,
      verify_count: 1,
      days_ago: 0,
      user_id: userId || null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('[questions] save failed:', error.message);
    return null;
  }
  return data;
}
