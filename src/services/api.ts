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
    console.log('🚀 Starting new analysis...');
    const res = await apiClient.post('/analysis/run');
    console.log('📋 Analysis started, response:', res.data);
    return res.data;
  },

  getStatus: async (analysisId: string) => {
    console.log(`🔍 Checking status for analysis: ${analysisId}`);
    const res = await apiClient.get(`/analysis/status/${analysisId}`);
    console.log(`📡 Status API response:`, res.data);
    return res.data.analysisStatus;
  },

  getResult: async (analysisId: string): Promise<LLMAnalysisResult[]> => {
    console.log(`📥 Getting results for analysis: ${analysisId}`);
    const res = await apiClient.get(`/analysis/result/${analysisId}`);
    console.log(`📊 Results received:`, res.data);
    return res.data;
  },

  /**
   * 최근 분석 결과 조회
   */
  getLatestAnalysis: async (): Promise<LLMAnalysisResult[]> => {
    try {
      console.log('📥 Fetching latest analysis...');
      const response = await apiClient.get('/analysis/latest');
      console.log('📊 Latest analysis response:', response.data);
      return response.data;
    } catch (error) {
      console.error('🚨 분석 결과 조회 실패:', error);
      throw error;
    }
  },
};