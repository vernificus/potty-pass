import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { AVATAR_OPTIONS } from '../constants';
import { X, Plus, Save, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSave: (students: Student[]) => void;
  onClearLogs: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, students, onSave, onClearLogs }) => {
  const [editedStudents, setEditedStudents] = useState<Student[]>(students);

  useEffect(() => {
    setEditedStudents(students);
  }, [students, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (id: string, newName: string) => {
    setEditedStudents(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s));
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this student?')) {
      setEditedStudents(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleAdd = () => {
    const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
    const newStudent: Student = {
      id: Date.now().toString(),
      name: '',
      avatar: randomAvatar
    };
    setEditedStudents(prev => [...prev, newStudent]);
  };

  const handleCycleAvatar = (id: string) => {
    setEditedStudents(prev => prev.map(s => {
      if (s.id !== id) return s;
      const currentIndex = AVATAR_OPTIONS.indexOf(s.avatar);
      const nextIndex = (currentIndex + 1) % AVATAR_OPTIONS.length;
      return { ...s, avatar: AVATAR_OPTIONS[nextIndex] };
    }));
  };

  const handleSave = () => {
    const validStudents = editedStudents.filter(s => s.name.trim().length > 0);
    onSave(validStudents);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800 font-comic">Class Roster</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {editedStudents.map(student => (
                <div key={student.id} className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <button 
                        onClick={() => handleCycleAvatar(student.id)}
                        className="text-2xl w-10 h-10 flex items-center justify-center hover:bg-slate-200 rounded-full transition-colors cursor-pointer select-none"
                        title="Click to change avatar"
                    >
                        {student.avatar}
                    </button>
                    <input 
                        type="text"
                        value={student.name}
                        onChange={(e) => handleNameChange(student.id, e.target.value)}
                        placeholder="Student Name"
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus={student.name === ''}
                    />
                    <button 
                        onClick={() => handleDelete(student.id)}
                        className="text-rose-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove student"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            ))}
            {editedStudents.length === 0 && (
                <p className="text-center text-slate-400 py-4">No students yet. Add some!</p>
            )}
            
            <button 
                onClick={handleAdd}
                className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 rounded-xl hover:border-indigo-400 hover:text-indigo-600 font-bold flex items-center justify-center gap-2 transition-all bg-slate-50 hover:bg-indigo-50"
            >
                <Plus size={20} />
                Add Student
            </button>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-between items-center gap-3">
            <button
                onClick={() => {
                    if(confirm("Start a new day? This will clear today's history log.")) {
                        onClearLogs();
                        onClose();
                    }
                }}
                className="text-rose-500 text-sm font-bold hover:underline px-2"
            >
                Start New Day
            </button>

            <div className="flex gap-3">
                <button onClick={onClose} className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors">
                    Cancel
                </button>
                <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200">
                    <Save size={18} />
                    Save Changes
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};