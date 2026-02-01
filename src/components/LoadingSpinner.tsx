import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = '데이터를 분석 중입니다...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center">
        <Loader className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
        <p className="text-xl text-gray-200 font-semibold">{message}</p>
        <p className="text-sm text-gray-400 mt-2">잠시만 기다려주세요...</p>
      </div>
    </div>
  );
};