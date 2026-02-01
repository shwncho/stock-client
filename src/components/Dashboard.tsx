import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { AnalysisHeader } from './AnalysisHeader';
import { StockCard } from './StockCard';
import { ChartComponent } from './ChartComponent';
import { LoadingSpinner } from './LoadingSpinner';
import { analysisAPI } from '../services/api';
import type { LLMAnalysisResult, DailyPrice } from '../types';

export const Dashboard: React.FC = () => {
  const [analyses, setAnalyses] = useState<LLMAnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<LLMAnalysisResult | null>(null);
  const [dailyPrices, setDailyPrices] = useState<DailyPrice[]>([]);

  // 초기 로드
  useEffect(() => {
    loadLatestAnalysis();
  }, []);

  const loadLatestAnalysis = async () => {
    try {
      setLoading(true);
      const results = await analysisAPI.getLatestAnalysis();
      setAnalyses(results);
    } catch (error) {
      console.error('분석 결과 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    try {
      setLoading(true);
      const results = await analysisAPI.runAnalysis();
      setAnalyses(results);
    } catch (error) {
      console.error('분석 실행 실패:', error);
      alert('분석 실행에 실패했습니다. 콘솔을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleExpandCard = (analysis: LLMAnalysisResult) => {
    setSelectedAnalysis(analysis);
    // dailyPricesJson 파싱
    try {
      const prices = JSON.parse(analysis.llmAnalysis || '[]');
      setDailyPrices(prices);
    } catch (e) {
      console.log('차트 데이터 없음');
    }
  };

  const handleDownloadReport = () => {
    const reportData = {
      analysisDate: new Date().toLocaleString('ko-KR'),
      totalStocks: analyses.length,
      analyses: analyses.map((a) => ({
        종목명: a.stockName,
        종목코드: a.stockCode,
        추천: a.recommendation,
        분석: a.llmAnalysis.substring(0, 500) + '...',
      })),
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stock-analysis-report-${new Date().getTime()}.json`;
    link.click();
  };

  if (loading && analyses.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <AnalysisHeader
          onRunAnalysis={handleRunAnalysis}
          isLoading={loading}
          analysisDate={analyses[0]?.analysisDate}
        />

        {/* 다운로드 버튼 */}
        {analyses.length > 0 && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleDownloadReport}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="h-5 w-5" />
              보고서 다운로드
            </button>
          </div>
        )}

        {/* 메인 콘텐츠 */}
        {analyses.length > 0 ? (
          <>
            {/* 종목 카드 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {analyses.map((analysis) => (
                <StockCard
                  key={analysis.stockCode}
                  analysis={analysis}
                  onExpand={handleExpandCard}
                />
              ))}
            </div>

            {/* 상세 분석 모달 */}
            {selectedAnalysis && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                  <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 flex justify-between items-center">
                    <h2 className="text-3xl font-bold">
                      {selectedAnalysis.stockName} ({selectedAnalysis.stockCode})
                    </h2>
                    <button
                      onClick={() => setSelectedAnalysis(null)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="p-8 space-y-8">
                    {/* 추천 */}
                    <div>
                      <h3 className="text-2xl font-bold mb-4 text-gray-800">
                        투자 의견
                      </h3>
                      <div
                        className={`inline-block px-6 py-3 rounded-full text-xl font-bold border-2 ${
                          selectedAnalysis.recommendation === 'BUY'
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : selectedAnalysis.recommendation === 'SELL'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                        }`}
                      >
                        {selectedAnalysis.recommendation === 'BUY'
                          ? '매수 추천'
                          : selectedAnalysis.recommendation === 'SELL'
                          ? '매도 추천'
                          : '보유 권고'}
                      </div>
                    </div>

                    {/* 상세 분석 */}
                    <div>
                      <h3 className="text-2xl font-bold mb-4 text-gray-800">
                        상세 분석
                      </h3>
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {selectedAnalysis.llmAnalysis}
                      </div>
                    </div>

                    {/* 차트 */}
                    {dailyPrices.length > 0 && (
                      <ChartComponent
                        data={dailyPrices}
                        title={`${selectedAnalysis.stockName} - 최근 60일 일봉 데이터`}
                      />
                    )}

                    {/* 분석 정보 */}
                    <div className="text-sm text-gray-500 border-t pt-6">
                      <p>분석일: {new Date(selectedAnalysis.analysisDate).toLocaleString('ko-KR')}</p>
                      <p>생성일: {new Date(selectedAnalysis.createdAt).toLocaleString('ko-KR')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">분석 결과가 없습니다.</p>
            <p className="text-gray-400 text-sm mt-2">
              위의 "분석 실행" 버튼을 클릭하여 분석을 시작하세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};