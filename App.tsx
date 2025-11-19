
import React, { useState, useEffect, useCallback } from 'react';
import { DEFAULT_STUDENTS } from './constants';
import { Student, AppStatus, LogEntry } from './types';
import { Timer } from './components/Timer';
import { HistoryLog } from './components/HistoryLog';
import { SettingsModal } from './components/SettingsModal';
import { DoorOpen, CheckCircle2, AlertCircle, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.FREE);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // Student Data State
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('pottypass_students');
    return saved ? JSON.parse(saved) : DEFAULT_STUDENTS;
  });

  // Logs State with Persistence
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('pottypass_logs');
    if (saved) {
      try {
        // Reviver function to convert date strings back to Date objects
        return JSON.parse(saved, (key, value) => {
          if (key === 'timeOut' || key === 'timeIn') {
            return value ? new Date(value) : null;
          }
          return value;
        });
      } catch (e) {
        console.error("Failed to parse logs", e);
        return [];
      }
    }
    return [];
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Derived state for current active log ID
  const [currentLogId, setCurrentLogId] = useState<string | null>(null);

  // Restore active session if page was reloaded while someone was out
  useEffect(() => {
    if (status === AppStatus.FREE) {
        const activeLog = logs.find(l => l.timeIn === null);
        if (activeLog) {
            const student = students.find(s => s.name === activeLog.studentName);
            if (student) {
                setStatus(AppStatus.OCCUPIED);
                setCurrentStudent(student);
                setStartTime(activeLog.timeOut);
                setCurrentLogId(activeLog.id);
            }
        }
    }
  }, []); // Run once on mount

  // Save logs whenever they change
  useEffect(() => {
    localStorage.setItem('pottypass_logs', JSON.stringify(logs));
  }, [logs]);

  const updateStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    localStorage.setItem('pottypass_students', JSON.stringify(newStudents));
  };

  const handleClearLogs = () => {
    setLogs([]);
    localStorage.removeItem('pottypass_logs');
    setStatus(AppStatus.FREE);
    setCurrentStudent(null);
    setStartTime(null);
    setCurrentLogId(null);
  };

  const handleSignOut = useCallback((student: Student) => {
    const now = new Date();
    const newLogId = Date.now().toString();
    
    setStatus(AppStatus.OCCUPIED);
    setCurrentStudent(student);
    setStartTime(now);
    setCurrentLogId(newLogId);
    
    // Create initial log entry
    const newLog: LogEntry = {
      id: newLogId,
      studentName: student.name,
      timeOut: now,
      timeIn: null,
      durationSeconds: null
    };
    setLogs(prev => [...prev, newLog]);
  }, []);

  const handleSignIn = useCallback(() => {
    if (!currentStudent || !startTime || !currentLogId) return;

    const now = new Date();
    const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000);

    // Update Log
    setLogs(prev => prev.map(log => {
      if (log.id === currentLogId) {
        return { ...log, timeIn: now, durationSeconds: duration };
      }
      return log;
    }));

    // Reset State
    setStatus(AppStatus.FREE);
    setCurrentStudent(null);
    setStartTime(null);
    setCurrentLogId(null);
  }, [currentStudent, startTime, currentLogId]);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto flex flex-col gap-8">
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        students={students}
        onSave={updateStudents}
        onClearLogs={handleClearLogs}
      />

      {/* Header */}
      <header className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl md:text-4xl font-comic font-bold text-slate-800 tracking-tight">PottyPass 🚽</h1>
          <p className="text-slate-500 font-medium">Classroom Bathroom Tracker</p>
        </div>
        
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-3 bg-slate-50 hover:bg-indigo-50 rounded-full shadow-sm text-slate-400 hover:text-indigo-600 transition-all duration-200"
          title="Settings"
        >
          <Settings size={28} />
        </button>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Status & Action */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Status Card */}
          <div className={`rounded-[3rem] p-8 text-center shadow-xl transition-all duration-700 border-8 ${
            status === AppStatus.FREE 
              ? 'bg-emerald-400 border-emerald-200 shadow-emerald-200/50' 
              : 'bg-rose-400 border-rose-200 shadow-rose-200/50'
          }`}>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 inline-block mb-4">
              {status === AppStatus.FREE ? (
                <DoorOpen size={80} className="text-white" />
              ) : (
                <AlertCircle size={80} className="text-white animate-bounce" />
              )}
            </div>
            <h2 className="text-5xl font-comic font-bold text-white mb-2 tracking-wide drop-shadow-md">
              {status === AppStatus.FREE ? 'FREE' : 'BUSY'}
            </h2>
            <p className="text-white/90 font-medium text-lg">
              {status === AppStatus.FREE ? 'Bathroom is empty' : 'Bathroom is occupied'}
            </p>
          </div>

          {/* Active Student Card (Only visible if occupied) */}
          {status === AppStatus.OCCUPIED && currentStudent && startTime && (
            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-rose-100 flex flex-col items-center text-center animate-fade-in">
              <div className="text-6xl mb-4 filter drop-shadow-md">{currentStudent.avatar}</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-1">{currentStudent.name} is out</h3>
              <p className="text-slate-500 mb-6 text-sm">Don't forget to wash hands!</p>
              
              <div className="mb-8">
                <Timer startTime={startTime} />
              </div>

              <button
                onClick={handleSignIn}
                className="w-full py-4 px-8 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg hover:shadow-xl"
              >
                <CheckCircle2 className="w-6 h-6" />
                I'm Back!
              </button>
            </div>
          )}

          {/* Log Section for Teacher (Visible on Desktop left, below status) */}
          <div className="hidden lg:block">
             <HistoryLog logs={logs} />
          </div>
        </div>

        {/* Right Column: Student Grid */}
        <div className="lg:col-span-7">
          <div className={`bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-slate-100 h-full transition-opacity duration-500 ${
            status === AppStatus.OCCUPIED ? 'opacity-50 pointer-events-none grayscale-[0.5]' : 'opacity-100'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-700">Who needs to go?</h2>
              <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Select Your Name
              </span>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-12 px-4">
                 <p className="text-slate-400 mb-4">No students in the class yet!</p>
                 <button 
                   onClick={() => setIsSettingsOpen(true)}
                   className="text-indigo-600 font-bold hover:underline"
                 >
                   Add students now
                 </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleSignOut(student)}
                    className="group relative flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 border-2 border-transparent hover:border-indigo-200 transition-all duration-200 active:scale-95 aspect-square"
                  >
                    <span className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-200 filter drop-shadow-sm">
                      {student.avatar}
                    </span>
                    <span className="font-bold text-slate-600 group-hover:text-indigo-600 text-lg leading-tight">
                      {student.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
            
            {status === AppStatus.OCCUPIED && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/10 backdrop-blur-[1px] rounded-[2.5rem]">
                <div className="bg-slate-800/90 text-white px-6 py-3 rounded-full font-bold shadow-2xl transform -rotate-2 border border-white/20">
                  Wait for your turn! 🛑
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile-only Log Section */}
        <div className="col-span-1 lg:hidden">
          <HistoryLog logs={logs} />
        </div>

      </main>
    </div>
  );
};

export default App;
