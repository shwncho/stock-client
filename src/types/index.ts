export interface DailyPrice {
  stockCode: string;
  tradeDate: string;
  openPrice: number;
  closePrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
}

export interface StockData {
  stockCode: string;
  stockName: string;
  currentPrice: number;
  changePercent: number;
  tradingVolume: number;
  tradingAmount: number;
  priceHigh52Week: number;
  priceLow52Week: number;
  analysisDate: string;
  dailyPricesJson: string;
}

export interface LLMAnalysisResult {
  id: number;
  stockCode: string;
  stockName: string;
  analysisDate: string;
  llmAnalysis: string;
  recommendation: string;
  createdAt: string;
}

export interface AnalysisResponse {
  stockCode: string;
  stockName: string;
  currentPrice: number;
  changePercent: number;
  llmAnalysis: string;
  recommendation: string;
}