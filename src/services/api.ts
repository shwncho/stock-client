import axios from 'axios';
import { LLMAnalysisResult } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

export const analysisAPI = {
  /**
   * 분석 실행
   */
  startAnalysis: async (): Promise<{ analysisId: string }> => {
    const res = await apiClient.post('/analysis/run');
    return res.data;
  },

  getStatus: async (analysisId: string) => {
    const res = await apiClient.get(`/analysis/status/${analysisId}`);
    return res.data.status;
  },

  getResult: async (analysisId: string): Promise<LLMAnalysisResult[]> => {
    const res = await apiClient.get(`/analysis/result/${analysisId}`);
    return res.data;
  },

  /**
   * 최근 분석 결과 조회
   */
  getLatestAnalysis: async (): Promise<LLMAnalysisResult[]> => {
    try {
      const response = await apiClient.get('/analysis/latest');
      return response.data;
    } catch (error) {
      console.error('분석 결과 조회 실패:', error);
      throw error;
    }
  },
};