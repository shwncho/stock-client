import axios from 'axios';
import { LLMAnalysisResult } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000,
});

export const analysisAPI = {
  /**
   * 분석 실행
   */
  runAnalysis: async (): Promise<LLMAnalysisResult[]> => {
    try {
      const response = await apiClient.post('/analysis/run');
      return response.data;
    } catch (error) {
      console.error('분석 실행 실패:', error);
      throw error;
    }
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