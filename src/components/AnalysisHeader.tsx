import React from 'react';
import { Play, RefreshCw } from 'lucide-react';

interface AnalysisHeaderProps {
  onRunAnalysis: () => void;
  isLoading: boolean;
  analysisDate?: string;
}

export const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
  onRunAnalysis,
  isLoading,
  analysisDate,
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-8 rounded-lg shadow-lg mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">📈 주식 기술적 분석 대시보드</h1>
          <p className="text-gray-300">
            거래량 Top 10 종목을 LLM으로 분석합니다
          </p>
          {analysisDate && (
            <p className="text-sm text-gray-400 mt-2">
              분석일: {new Date(analysisDate).toLocaleDateString('ko-KR')}
            </p>
          )}
        </div>
        <button
          onClick={onRunAnalysis}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
        >
          {isLoading ? (
            <>
              <RefreshCw className="animate-spin h-5 w-5" />
              분석 중...
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              분석 실행
            </>
          )}
        </button>
      </div>
    </div>
  );
};