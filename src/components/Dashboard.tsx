import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
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

  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'DONE' | 'FAILED'>('IDLE');

  // 상태 변화 추적
  useEffect(() => {
    console.log('🔄 State changed:', {
      status,
      analysisId,
      analysesCount: analyses.length,
      loading,
      hasSelectedAnalysis: !!selectedAnalysis
    });
  }, [status, analysisId, analyses.length, loading, selectedAnalysis]);

  //초기 로드
  useEffect(() => {
    loadLatestAnalysis();
  }, []);

  useEffect(() => {
    if (!analysisId || status !== 'RUNNING') {
      console.log('📊 Polling stopped:', { analysisId, status });
      return;
    }

    console.log('🔄 Starting polling for analysis:', analysisId);
    
    const interval = setInterval(async () => {
      try {
        console.log('🔍 Checking status...');
        const jobStatus = await analysisAPI.getStatus(analysisId);
        console.log('📡 Server response:', jobStatus);

        if (jobStatus === 'DONE') {
          console.log('✅ Analysis completed');
          const results = await analysisAPI.getResult(analysisId);
          setAnalyses(results);
          setStatus('DONE');
          clearInterval(interval);
          return;
        }

        if (jobStatus === 'FAILED') {
          console.log('❌ Analysis failed');
          setStatus('FAILED');
          clearInterval(interval);
          return;
        }

        // 예상치 못한 상태 값 처리
        if (jobStatus !== 'RUNNING') {
          console.warn('⚠️ Unexpected status:', jobStatus);
          setStatus('FAILED');
          clearInterval(interval);
        }
      } catch (error) {
        console.error('🚨 Error during polling:', error);
        setStatus('FAILED');
        clearInterval(interval);
      }
    }, 3000);

    return () => {
      console.log('🛑 Cleaning up polling interval');
      clearInterval(interval);
    };
  }, [analysisId, status]);

  const loadLatestAnalysis = async () => {
    try {
      setLoading(true);
      console.log('📥 Loading latest analysis...');
      const results = await analysisAPI.getLatestAnalysis();
      console.log('📊 Latest analysis loaded:', results.length, 'items');
      setAnalyses(results);
    } catch (error) {
      console.error('🚨 분석 결과 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    try {
      console.log('🚀 Starting analysis...');
      setStatus('RUNNING');
      setLoading(false); // 중복 호출 방지

      const { analysisId } = await analysisAPI.startAnalysis();
      console.log('📋 Analysis started with ID:', analysisId);
      setAnalysisId(analysisId);
    } catch (error) {
      console.error('🚨 Failed to start analysis:', error);
      setStatus('FAILED');
      setLoading(false);
    }
  };

  const handleExpandCard = (analysis: LLMAnalysisResult) => {
    console.log('🔍 Expanding card for:', analysis.stockCode);
    setSelectedAnalysis(analysis);
    // 차트 데이터는 현재 API에서 제공하지 않으므로 비워둠
    setDailyPrices([]);
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

  if (status === 'RUNNING') {
    console.log('⏳ Rendering loading spinner, status:', status);
    return <LoadingSpinner message="분석 작업을 실행 중입니다..." />;
  }

  if (status === 'FAILED') {
    console.log('❌ Rendering error state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-red-800 mb-4">
              🚨 분석 작업에 실패했습니다
            </h2>
            <p className="text-red-600 mb-6">
              서버 응답이 없거나 에러가 발생했습니다. 브라우저 개발자 도구(F12)의 콘솔을 확인해보세요.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => setStatus('IDLE')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                🔄 다시 시도
              </button>
              <button
                onClick={loadLatestAnalysis}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                📊 기존 결과 보기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-gray-700 leading-relaxed prose prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            h1: ({children}) => <h1 className="text-xl font-bold text-gray-900 mb-3">{children}</h1>,
                            h2: ({children}) => <h2 className="text-lg font-semibold text-gray-800 mb-2">{children}</h2>,
                            h3: ({children}) => <h3 className="text-base font-medium text-gray-700 mb-2">{children}</h3>,
                            p: ({children}) => <p className="mb-3 text-gray-600">{children}</p>,
                            ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                            li: ({children}) => <li className="text-gray-600">{children}</li>,
                            strong: ({children}) => <strong className="font-semibold text-gray-800">{children}</strong>,
                            em: ({children}) => <em className="italic text-gray-600">{children}</em>,
                            blockquote: ({children}) => <blockquote className="border-l-4 border-blue-300 pl-4 py-2 mb-3 bg-blue-50 text-gray-700">{children}</blockquote>,
                            code: ({children}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm text-red-600">{children}</code>,
                            hr: () => <hr className="my-4 border-gray-300" />
                          }}
                        >
                          {selectedAnalysis.llmAnalysis}
                        </ReactMarkdown>
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