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
  const { data } = await api.post('/extract-skills', { jd, target_company: targetCompany, target_role: targetRole });
  return data;
}

export async function moderateText(text) {
  const { data } = await api.post('/moderate', { text });
  return data;
}

export async function analyzeJD({ jd, targetCompany, targetRole }) {
  const { data } = await api.post('/analyze-jd', {
    jd, target_company: targetCompany, target_role: targetRole,
  });
  return data;
}

export async function generatePlan({ company, role, heatmap, gaps, readiness }) {
  const { data } = await api.post('/generate-plan', { company, role, heatmap, gaps, readiness });
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
