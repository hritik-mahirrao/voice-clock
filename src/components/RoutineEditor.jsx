import React, { useState } from 'react';
import { Play, Square } from 'lucide-react';
import { executeSpeech } from '../utils/routineEngine';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export default function RoutineEditor({ initialRoutine, onSave, onCancel }) {
  const [name, setName] = useState(initialRoutine?.name || '');
  const [message, setMessage] = useState(initialRoutine?.message || '');
  const [intervalMinutes, setIntervalMinutes] = useState(initialRoutine?.intervalMinutes || '60');
  const [startTime, setStartTime] = useState(initialRoutine?.startTime || '09:00');
  const [endTime, setEndTime] = useState(initialRoutine?.endTime || '21:00');
  const [days, setDays] = useState(initialRoutine?.days || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
  const [speechRate, setSpeechRate] = useState(initialRoutine?.speechRate || 1.0);
  const [speechPitch, setSpeechPitch] = useState(initialRoutine?.speechPitch || 1.0);

  const toggleDay = (day) => {
    if (days.includes(day)) {
      setDays(days.filter(d => d !== day));
    } else {
      setDays([...days, day]);
    }
  };

  const handleSave = () => {
    if (!name || !message) return alert("Name and message are required.");
    onSave({
      id: initialRoutine?.id,
      name,
      message,
      intervalMinutes: parseFloat(intervalMinutes),
      startTime,
      endTime,
      days,
      speechRate: parseFloat(speechRate),
      speechPitch: parseFloat(speechPitch),
      active: initialRoutine ? initialRoutine.active : true
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <h2 className="text-xl font-medium text-white mb-4">
        {initialRoutine ? 'Edit Routine' : 'New Routine'}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Routine Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500"
            placeholder="e.g. Morning Affirmations"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Spoken Message</label>
          <textarea 
            value={message} 
            onChange={e => setMessage(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white h-32 focus:outline-none focus:border-orange-500"
            placeholder="Enter the long reflection or affirmation message here..."
          />
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-medium text-white">TTS Preview Settings</label>
            <button 
              onClick={() => executeSpeech(message, speechRate, speechPitch)}
              className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg text-sm"
            >
              <Play size={14} className="text-orange-400" />
              <span>Test Audio</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Speed: {speechRate}x</label>
              <input type="range" min="0.5" max="2.0" step="0.1" value={speechRate} onChange={e => setSpeechRate(e.target.value)} className="w-full accent-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Pitch: {speechPitch}</label>
              <input type="range" min="0.5" max="2.0" step="0.1" value={speechPitch} onChange={e => setSpeechPitch(e.target.value)} className="w-full accent-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Interval (minutes)</label>
            <input 
              type="number" 
              value={intervalMinutes} 
              onChange={e => setIntervalMinutes(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500"
            />
          </div>
          <div />
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Start Time</label>
            <input 
              type="time" 
              value={startTime} 
              onChange={e => setStartTime(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 style-color-scheme-dark"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">End Time</label>
            <input 
              type="time" 
              value={endTime} 
              onChange={e => setEndTime(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 style-color-scheme-dark"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-2">Active Days</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium uppercase transition-colors ${
                  days.includes(day) 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex space-x-3 mt-8">
        <button 
          onClick={handleSave}
          className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-medium py-3 rounded-xl transition-colors"
        >
          Save Routine
        </button>
        <button 
          onClick={onCancel}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-xl border border-zinc-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
