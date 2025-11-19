import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  startTime: Date;
}

export const Timer: React.FC<TimerProps> = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setElapsed(Math.floor((now.getTime() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  const isLongTime = minutes >= 5;

  return (
    <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-2xl font-bold font-mono border-4 shadow-sm transition-colors ${
      isLongTime 
        ? 'bg-red-100 text-red-600 border-red-200' 
        : 'bg-white text-slate-700 border-slate-100'
    }`}>
      <Clock className={isLongTime ? 'animate-pulse' : ''} />
      <span>
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
};