
import React from 'react';
import { LogEntry } from '../types';
import { FileText } from 'lucide-react';

interface HistoryLogProps {
  logs: LogEntry[];
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ logs }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
          <FileText className="text-slate-400" />
          Today's Activity
        </h2>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-xs">
            <tr>
              <th className="p-3">Student</th>
              <th className="p-3">Out</th>
              <th className="p-3">In</th>
              <th className="p-3 text-right">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400">
                  No trips yet today!
                </td>
              </tr>
            ) : (
              logs.slice().reverse().map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-medium text-slate-800">{log.studentName}</td>
                  <td className="p-3">{log.timeOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="p-3">
                    {log.timeIn 
                      ? log.timeIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                      : <span className="text-orange-500 font-bold animate-pulse">Active</span>
                    }
                  </td>
                  <td className="p-3 text-right font-mono">
                    {log.durationSeconds 
                      ? `${Math.floor(log.durationSeconds / 60)}m ${log.durationSeconds % 60}s`
                      : '-'
                    }
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
