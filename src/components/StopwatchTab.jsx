import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Check } from 'lucide-react';
import { speak, formatSpeechTime } from '../utils/speech';
import TimePickerModal from './TimePickerModal';

export default function StopwatchTab() {
  const [ms, setMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const [lastLapMs, setLastLapMs] = useState(0);

  // Settings
  const [intervalSpeak, setIntervalSpeak] = useState(true);
  const [intervalVal, setIntervalVal] = useState(30000); // ms
  const [speakLapTime, setSpeakLapTime] = useState(true);
  const [speakLapTotal, setSpeakLapTotal] = useState(false);

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const swRef = useRef(null);
  const nextTargetRef = useRef(30000);

  useEffect(() => {
    if (isRunning) {
      nextTargetRef.current = (Math.floor(ms / intervalVal) + 1) * intervalVal;
      
      swRef.current = setInterval(() => {
        setMs(prev => {
          const next = prev + 10;
          if (intervalSpeak && next >= nextTargetRef.current) {
            speak(formatSpeechTime(Math.floor(next / 1000)));
            nextTargetRef.current += intervalVal;
          }
          return next;
        });
      }, 10);
    } else {
      clearInterval(swRef.current);
    }
    return () => clearInterval(swRef.current);
  }, [isRunning, intervalSpeak, intervalVal]);

  const toggleSw = () => setIsRunning(!isRunning);

  const reset = () => {
    setIsRunning(false);
    setMs(0);
    setLaps([]);
    setLastLapMs(0);
  };

  const formatDisplay = (totalMs) => {
    const msPart = Math.floor((totalMs % 1000) / 10);
    const sPart = Math.floor((totalMs / 1000) % 60);
    const mPart = Math.floor((totalMs / 60000) % 60);
    const hPart = Math.floor(totalMs / 3600000);
    return {
      h: String(hPart).padStart(2, '0'),
      m: String(mPart).padStart(2, '0'),
      s: String(sPart).padStart(2, '0'),
      ms: String(msPart).padStart(2, '0')
    };
  };

  const addLap = () => {
    if (!isRunning) return;
    const currentLapMs = ms - lastLapMs;
    const newLap = {
      id: laps.length + 1,
      current: currentLapMs,
      total: ms
    };
    
    setLaps([newLap, ...laps]);
    setLastLapMs(ms);

    if (speakLapTime) {
      speak(`Lap ${newLap.id}, ${formatSpeechTime(Math.floor(currentLapMs / 1000))}`);
    } else if (speakLapTotal) {
      speak(`Total time, ${formatSpeechTime(Math.floor(ms / 1000))}`);
    }
  };

  const { h, m, s, ms: msStr } = formatDisplay(ms);

  const formatShortTime = (milli) => {
    const seconds = Math.floor(milli / 1000);
    if (seconds === 0) return "0s";
    const ms = Math.floor(seconds / 60);
    const ss = seconds % 60;
    if (ms > 0 && ss > 0) return `${ms}m ${ss}s`;
    if (ms > 0) return `${ms}m`;
    return `${ss}s`;
  };

  return (
    <section className="tab-content pink-theme">
      <TimePickerModal 
        isOpen={isPickerOpen}
        title="Time"
        initialSeconds={Math.floor(intervalVal / 1000)}
        onClose={() => setIsPickerOpen(false)}
        onSave={(val) => setIntervalVal(val * 1000)}
      />
      <div className="display-container">
        <div className="time-display">
          <span>{h}</span><span className="colon">:</span>
          <span>{m}</span><span className="colon">:</span>
          <span>{s}</span><span className="ms">{msStr}</span>
        </div>
        <div className="time-labels">
          <span>h</span><span>m</span><span>s</span>
        </div>
      </div>

      <div className="settings-panel">
        <div className="setting-row">
          <label className="checkbox-label">
            <input type="checkbox" checked={intervalSpeak} onChange={e => setIntervalSpeak(e.target.checked)} />
            <span className="custom-checkbox pink-check"><Check size={14} /></span> Interval
          </label>
          <button 
            className="text-btn" 
            style={{background: 'var(--btn-bg)', padding: '5px 10px', borderRadius: '5px', border: '1px solid #444', fontSize: '0.9rem'}}
            onClick={() => setIsPickerOpen(true)}
          >
            {formatShortTime(intervalVal)} <span style={{fontSize: '0.7em'}}>▼</span>
          </button>
          <label className="checkbox-label">
            <input type="checkbox" checked={intervalSpeak} onChange={e => setIntervalSpeak(e.target.checked)} />
            <span className="custom-checkbox pink-check"><Check size={14} /></span> Speaking
          </label>
        </div>
        <div className="setting-row">
          <label className="checkbox-label">
            <input type="checkbox" checked={speakLapTime} onChange={e => {setSpeakLapTime(e.target.checked); if(e.target.checked) setSpeakLapTotal(false);}} />
            <span className="custom-checkbox pink-check"><Check size={14} /></span> Speak lap time
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={speakLapTotal} onChange={e => {setSpeakLapTotal(e.target.checked); if(e.target.checked) setSpeakLapTime(false);}} />
            <span className="custom-checkbox pink-check"><Check size={14} /></span> Speak lap total
          </label>
        </div>
      </div>

      <div className="laps-container">
        {laps.map(lap => {
          const cur = formatDisplay(lap.current);
          const tot = formatDisplay(lap.total);
          return (
            <div key={lap.id} className="lap-item">
              <span>Lap {lap.id}</span>
              <span>+{cur.h}:{cur.m}:{cur.s}.{cur.ms}</span>
              <span>{tot.h}:{tot.m}:{tot.s}.{tot.ms}</span>
            </div>
          )
        })}
      </div>

      <div className="controls-container">
        <button className="text-btn" onClick={reset}>Reset</button>
        <button className="main-action-btn pink-btn" onClick={toggleSw}>
          {isRunning ? <Pause size={30} fill="currentColor" /> : <Play size={30} fill="currentColor" />}
        </button>
        <button className="text-btn" onClick={addLap}>Lap</button>
      </div>
    </section>
  );
}
