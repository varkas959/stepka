import axios from 'axios';

const BASE = process.env.REACT_APP_BACKEND_URL;

export const api = axios.create({
  baseURL: `${BASE}/api`,
  timeout: 60000,
});

export async function gradeAnswer({ question, answer, mode, isBehavioral, topic }) {
  const { data } = await api.post('/grade', {
    question, answer, mode, is_behavioral: isBehavioral, topic,
  });
  return data;
}

export async function analyzeJD({ jd, targetCompany, targetRole }) {
  const { data } = await api.post('/analyze-jd', {
    jd, target_company: targetCompany, target_role: targetRole,
  });
  return data;
}
