import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ChartComponent } from '../components/ChartComponent';
import { analysisAPI } from '../services/api';
import { LLMAnalysisResult, DailyPrice } from '../types';

export const AnalysisPage: React.FC = () => {
  const { stockCode } = useParams<{ stockCode: string }>();
  const [analysis, setAnalysis] = useState<LLMAnalysisResult | null>(null);
  const [dailyPrices, setDailyPrices] = useState<DailyPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysisDetail();
  }, [stockCode]);

  const loadAnalysisDetail = async () => {
    try {
      setLoading(true);
      const results = await analysisAPI.getLatestAnalysis();
      const foundAnalysis = results.find((a) => a.stockCode === stockCode);
      
      if (foundAnalysis) {
        setAnalysis(foundAnalysis);
        try {
          const prices = JSON.parse(foundAnalysis.llmAnalysis || '[]');
          setDailyPrices(prices);
        } catch (e) {
          console.log('차트 데이터 없음');
        }
      }
    } catch (error) {
      console.error('분석 상세 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">분석 데이터를 찾을 수 없습니다.</p>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-8 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </a>
            <div>
              <h1 className="text-3xl font-bold">{analysis.stockName}</h1>
              <p className="text-gray-300">{analysis.stockCode}</p>
            </div>
          </div>
          <div
            className={`px-6 py-3 rounded-full text-xl font-bold border-2 ${getRecommendationColor(
              analysis.recommendation
            )}`}
          >
            {getRecommendationLabel(analysis.recommendation)}
          </div>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* 분석 정보 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">분석 정보</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">종목 코드</p>
              <p className="text-2xl font-bold text-blue-600">{analysis.stockCode}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">투자 의견</p>
              <p className="text-2xl font-bold text-green-600">
                {getRecommendationLabel(analysis.recommendation)}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">분석 날짜</p>
              <p className="text-lg font-bold text-purple-600">
                {new Date(analysis.analysisDate).toLocaleDateString('ko-KR')}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">생성 날짜</p>
              <p className="text-lg font-bold text-orange-600">
                {new Date(analysis.createdAt).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>
        </div>

        {/* LLM 분석 결과 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">LLM 기술적 분석</h2>
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {analysis.llmAnalysis}
            </p>
          </div>
        </div>

        {/* 차트 */}
        {dailyPrices.length > 0 && (
          <ChartComponent
            data={dailyPrices}
            title={`${analysis.stockName} - 일봉 데이터`}
          />
        )}

        {/* 상세 정보 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">추가 정보</h2>
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-4">
              <span className="text-gray-600">분석 유형</span>
              <span className="font-bold text-gray-800">LLM 기반 기술적 분석</span>
            </div>
            <div className="flex justify-between border-b pb-4">
              <span className="text-gray-600">데이터 소스</span>
              <span className="font-bold text-gray-800">한국투자증권 OpenAPI</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">분석 종목</span>
              <span className="font-bold text-gray-800">거래량 Top 10</span>
            </div>
          </div>
        </div>

        {/* 면책 사항 */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
          <h3 className="font-bold text-yellow-800 mb-2">⚠️ 면책 사항</h3>
          <p className="text-yellow-700 text-sm">
            본 분석은 LLM(대형 언어 모델)의 기술적 분석에 기반한 것으로, 실제 투자 결정의 책임은 본인에게 있습니다. 
            투자 전에 전문가의 조언을 구하시고, 충분한 조사 후 투자 결정을 하시기 바랍니다.
          </p>
        </div>
      </div>
    </div>
  );
};
