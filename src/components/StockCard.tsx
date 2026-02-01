import React from 'react';
import { Zap } from 'lucide-react';
import type { LLMAnalysisResult } from '../types';

interface StockCardProps {
  analysis: LLMAnalysisResult;
  onExpand: (analysis: LLMAnalysisResult) => void;
}

export const StockCard: React.FC<StockCardProps> = ({ analysis, onExpand }) => {
  const isPositive = analysis.recommendation === 'BUY';
  const isNegative = analysis.recommendation === 'SELL';

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'BUY':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'SELL':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'HOLD':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationLabel = (rec: string) => {
    switch (rec) {
      case 'BUY':
        return '매수 추천';
      case 'SELL':
        return '매도 추천';
      case 'HOLD':
        return '보유 권고';
      default:
        return '분석 중';
    }
  };

  return (
    <div
      onClick={() => onExpand(analysis)}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer p-6 border-l-4 border-blue-500"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            {analysis.stockName}
          </h3>
          <p className="text-gray-500 text-sm">{analysis.stockCode}</p>
        </div>
        <div
          className={`px-4 py-2 rounded-full border-2 font-bold text-center ${getRecommendationColor(
            analysis.recommendation
          )}`}
        >
          {getRecommendationLabel(analysis.recommendation)}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-gray-600 text-sm">분석 요약</p>
            <p className="text-gray-800 line-clamp-2">
              {analysis.llmAnalysis.substring(0, 150)}...
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <p className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
            상세 분석 보기 →
          </p>
        </div>
      </div>
    </div>
  );
};