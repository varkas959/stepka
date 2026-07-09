import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

export async function gradeAnswer({ question, answer, mode, isBehavioral, topic }) {
  const { data } = await api.post('/grade', {
    question, answer, mode, is_behavioral: isBehavioral, topic,
  });
  return data;
}

export async function extractSkills({ jd, targetCompany, targetRole }) {
  const { data } = await api.post('/jd', { action: 'extract', jd, target_company: targetCompany, target_role: targetRole });
  return data;
}

export async function moderateText(text) {
  const { data } = await api.post('/moderate', { text });
  return data;
}

export async function generatePlan({ company, role, heatmap, gaps, readiness, falseConfidenceSkills, highRiskSkills }) {
  const { data } = await api.post('/generate-plan', { company, role, heatmap, gaps, readiness, falseConfidenceSkills, highRiskSkills });
  return data;
}

// Gap Intelligence — per-skill deep cards (why it matters, what's tested, mistakes, activities)
export async function getGapIntelligence({ company, role, skills }) {
  const { data } = await api.post('/gap-intelligence', { company, role, skills });
  return data;
}

// Challenge My Readiness — adaptive interviewer; stateless, transcript replayed each turn
export async function challengeTurn({ company, role, skill, transcript }) {
  const { data } = await api.post('/challenge', { company, role, skill, transcript });
  return data;
}

// Depth Intelligence — level-based depth probe (mode: 'depth'); transcript carries levels
export async function depthProbe({ company, role, skill, transcript }) {
  const { data } = await api.post('/challenge', { mode: 'depth', company, role, skill, transcript });
  return data;
}

export async function generateAssessment({ company, role, competencies, weakSkills, mode }) {
  const { data } = await api.post('/generate-assessment', { company, role, competencies, weakSkills, mode });
  return data;
}

export async function evaluateAssessment({ company, role, qa }) {
  const { data } = await api.post('/evaluate-assessment', { company, role, qa });
  return data;
}

export async function saveReport({ company, role, readiness, heatmap, gaps, summary, userId }) {
  const { data } = await api.post('/save-report', { company, role, readiness, heatmap, gaps, summary, userId });
  return data;
}
