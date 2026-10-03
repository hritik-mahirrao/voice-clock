import { useState, useEffect, useRef } from 'react';
import { Volume2, Palette, Type, Settings, BellOff, List, Play, Pause, RotateCcw, Check } from 'lucide-react';
import { speak, formatSpeechTime } from '../utils/speech';

export default function TimerTab() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  // Settings
  const [preCountdown, setPreCountdown] = useState(0);
  const [intervalSpeak, setIntervalSpeak] = useState(true);
  const [intervalVal, setIntervalVal] = useState(60);
  const [countdownSpeak, setCountdownSpeak] = useState(true);
  const [countdownVal, setCountdownVal] = useState(10);

  const timerRef = useRef(null);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            speak("Time is up!");
            return 0;
          }
          
          const next = prev - 1;
          
          if (intervalSpeak && next > 0 && next % intervalVal === 0) {
            speak(formatSpeechTime(next) + " left");
          }
          
          if (countdownSpeak && next > 0 && next <= countdownVal) {
            speak(next.toString());
          }
          
          return next;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, intervalSpeak, intervalVal, countdownSpeak, countdownVal]);

  const toggleTimer = () => {
    if (seconds <= 0) return;
    setIsRunning(!isRunning);
  };

  const addTime = (addSec) => {
    if (!isRunning) {
      setSeconds(prev => prev + addSec);
    }
  };

  const reset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  return (
    <section className="tab-content blue-theme">
      <div className="toolbar">
        <button><Volume2 size={20} /></button>
        <button className="active-blue"><Palette size={20} /></button>
        <button><Type size={20} /></button>
        <button><Settings size={20} /></button>
      </div>
      
      <div className="display-container">
        <div className="time-display">
          <span>{String(h).padStart(2, '0')}</span><span className="colon">:</span>
          <span>{String(m).padStart(2, '0')}</span><span className="colon">:</span>
          <span>{String(s).padStart(2, '0')}</span>
        </div>
        <div className="time-labels">
          <span>h</span><span>m</span><span>s</span>
        </div>
      </div>

      <div className="settings-panel">
        <div className="setting-row">
          <label>Countdown before starting</label>
          <select value={preCountdown} onChange={e => setPreCountdown(Number(e.target.value))}>
            <option value="0">0s</option>
            <option value="3">3s</option>
            <option value="5">5s</option>
            <option value="10">10s</option>
          </select>
          <button className="icon-btn"><Volume2 size={16} /></button>
        </div>
        <div className="setting-row">
          <label className="checkbox-label">
            <input type="checkbox" checked={intervalSpeak} onChange={e => setIntervalSpeak(e.target.checked)} />
            <span className="custom-checkbox"><Check size={14} /></span> Interval
          </label>
          <select value={intervalVal} onChange={e => setIntervalVal(Number(e.target.value))}>
            <option value="30">30s</option>
            <option value="60">60s</option>
            <option value="300">5m</option>
          </select>
          <label className="checkbox-label" style={{marginLeft: 'auto'}}>
            <input type="checkbox" checked={intervalSpeak} onChange={e => setIntervalSpeak(e.target.checked)} />
            <span className="custom-checkbox"><Check size={14} /></span> Speaking
          </label>
          <button className="icon-btn"><BellOff size={16} /></button>
        </div>
        <div className="setting-row">
          <label className="checkbox-label">
            <input type="checkbox" checked={countdownSpeak} onChange={e => setCountdownSpeak(e.target.checked)} />
            <span className="custom-checkbox"><Check size={14} /></span> Countdown
          </label>
          <select value={countdownVal} onChange={e => setCountdownVal(Number(e.target.value))}>
            <option value="5">5s</option>
            <option value="10">10s</option>
          </select>
          <label className="checkbox-label" style={{marginLeft: 'auto'}}>
            <input type="checkbox" checked={countdownSpeak} onChange={e => setCountdownSpeak(e.target.checked)} />
            <span className="custom-checkbox"><Check size={14} /></span> Speaking
          </label>
          <button className="icon-btn"><BellOff size={16} /></button>
        </div>
      </div>

      <div className="controls-container">
        <div className="quick-add">
          <button className="icon-btn"><List size={20} /></button>
          <button className="quick-btn" onClick={() => addTime(300)}>+5m</button>
          <button className="quick-btn" onClick={() => addTime(60)}>+1m</button>
        </div>
        
        <button className="main-action-btn blue-btn" onClick={toggleTimer}>
          {isRunning ? <Pause size={30} fill="currentColor" /> : <Play size={30} fill="currentColor" />}
        </button>
        
        <div className="quick-add">
          <button className="icon-btn" onClick={reset}><RotateCcw size={20} /></button>
          <button className="quick-btn" onClick={() => addTime(10)}>+10s</button>
          <button className="quick-btn" onClick={() => addTime(30)}>+30s</button>
        </div>
      </div>
    </section>
  );
}
