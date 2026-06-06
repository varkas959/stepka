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
