import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Check, List, Volume2, Palette, Type, Settings, BellOff } from 'lucide-react';
import { speak, formatSpeechTime } from '../utils/speech';
import TimePickerModal from './TimePickerModal';

export default function TimerTab() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  // Settings
  const [preCountdown, setPreCountdown] = useState(0);
  const [intervalSpeak, setIntervalSpeak] = useState(true);
  const [intervalVal, setIntervalVal] = useState(60);
  const [countdownSpeak, setCountdownSpeak] = useState(true);
  const [countdownVal, setCountdownVal] = useState(10);

  const [pickerConfig, setPickerConfig] = useState({ isOpen: false, type: null, initialVal: 0 });

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

  const formatShortTime = (seconds) => {
    if (seconds === 0) return "0s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0 && s > 0) return `${m}m ${s}s`;
    if (m > 0) return `${m}m`;
    return `${s}s`;
  };

  const handleSavePicker = (val) => {
    if (pickerConfig.type === 'interval') setIntervalVal(val);
    else if (pickerConfig.type === 'countdown') setCountdownVal(val);
  };

  return (
    <section className="tab-content blue-theme">
      <TimePickerModal 
        isOpen={pickerConfig.isOpen}
        title="Time"
        initialSeconds={pickerConfig.initialVal}
        onClose={() => setPickerConfig({ ...pickerConfig, isOpen: false })}
        onSave={handleSavePicker}
      />
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
          <button 
            className="text-btn" 
            style={{background: 'var(--btn-bg)', padding: '5px 10px', borderRadius: '5px', border: '1px solid #444', fontSize: '0.9rem'}}
            onClick={() => setPickerConfig({ isOpen: true, type: 'interval', initialVal: intervalVal })}
          >
            {formatShortTime(intervalVal)} <span style={{fontSize: '0.7em'}}>▼</span>
          </button>
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
          <button 
            className="text-btn" 
            style={{background: 'var(--btn-bg)', padding: '5px 10px', borderRadius: '5px', border: '1px solid #444', fontSize: '0.9rem'}}
            onClick={() => setPickerConfig({ isOpen: true, type: 'countdown', initialVal: countdownVal })}
          >
            {formatShortTime(countdownVal)} <span style={{fontSize: '0.7em'}}>▼</span>
          </button>
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
