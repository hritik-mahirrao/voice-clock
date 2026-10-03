import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Check, List, Volume2, Palette, Type, Settings, BellOff, Bookmark } from 'lucide-react';
import { speak, formatSpeechTime } from '../utils/speech';
import TimePickerModal from './TimePickerModal';
import TemplatesModal from './TemplatesModal';

export default function TimerTab() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  // Settings
  const [preCountdown, setPreCountdown] = useState(0);
  const [intervalSpeak, setIntervalSpeak] = useState(true);
  const [intervalVal, setIntervalVal] = useState(60);
  const [countdownSpeak, setCountdownSpeak] = useState(true);
  const [countdownVal, setCountdownVal] = useState(10);
  const [voiceNote, setVoiceNote] = useState("");

  const [pickerConfig, setPickerConfig] = useState({ isOpen: false, type: null, initialVal: 0 });
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [editingTemplateId, setEditingTemplateId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('voiceClock_timerTemplates');
    if (stored) setTemplates(JSON.parse(stored));
  }, []);

  const currentSettings = {
    seconds, preCountdown, intervalSpeak, intervalVal, countdownSpeak, countdownVal, voiceNote
  };

  const isMatch = (tSettings, current) => {
    return Object.keys(current).every(k => tSettings[k] === current[k]);
  };
  const activeTemplate = templates.find(t => isMatch(t.settings, currentSettings));

  const handleApplyTemplate = (t) => {
    const s = t.settings;
    setSeconds(s.seconds || 0);
    setPreCountdown(s.preCountdown ?? 0);
    setIntervalSpeak(s.intervalSpeak ?? true);
    setIntervalVal(s.intervalVal || 60);
    setCountdownSpeak(s.countdownSpeak ?? true);
    setCountdownVal(s.countdownVal || 10);
    setVoiceNote(s.voiceNote || "");
  };

  const handleEditSettings = (t) => {
    handleApplyTemplate(t);
    setEditingTemplateId(t.id);
  };

  const handleUpdateTemplate = () => {
    const updatedTemplates = templates.map(t => 
      t.id === editingTemplateId ? { ...t, settings: currentSettings } : t
    );
    setTemplates(updatedTemplates);
    localStorage.setItem('voiceClock_timerTemplates', JSON.stringify(updatedTemplates));
    setEditingTemplateId(null);
  };

  const timerRef = useRef(null);
  const targetTimeRef = useRef(0);
  const wakeLockRef = useRef(null);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch (err) {
      console.error('Wake Lock error:', err);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(console.error);
      wakeLockRef.current = null;
    }
  };

  useEffect(() => {
    let lastSpokenInterval = null;
    let lastSpokenCountdown = null;

    if (isRunning) {
      requestWakeLock();
      targetTimeRef.current = Date.now() + seconds * 1000;
      
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const remainingMs = targetTimeRef.current - now;
        const remainingSec = Math.ceil(remainingMs / 1000);

        if (remainingSec <= 0) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          setSeconds(0);
          releaseWakeLock();
          speak("Time is up!");
          return;
        }
        
        setSeconds(remainingSec);
        
        if (intervalSpeak && remainingSec > 0 && remainingSec % intervalVal === 0) {
          if (lastSpokenInterval !== remainingSec) {
            let msg = formatSpeechTime(remainingSec) + " left";
            if (voiceNote.trim()) {
              msg += ". " + voiceNote.trim();
            }
            speak(msg);
            lastSpokenInterval = remainingSec;
          }
        }
        
        if (countdownSpeak && remainingSec > 0 && remainingSec <= countdownVal) {
          if (lastSpokenCountdown !== remainingSec) {
            speak(remainingSec.toString());
            lastSpokenCountdown = remainingSec;
          }
        }
      }, 100); // Check frequently to handle background throttling
    } else {
      clearInterval(timerRef.current);
      releaseWakeLock();
    }
    return () => {
      clearInterval(timerRef.current);
      releaseWakeLock();
    };
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
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        type="timer"
        currentSettings={currentSettings}
        onApply={handleApplyTemplate}
        templates={templates}
        setTemplates={setTemplates}
        activeTemplateId={activeTemplate?.id}
        onEditSettings={handleEditSettings}
      />
      <div className="toolbar">
        <button onClick={() => setIsTemplatesOpen(true)}><Bookmark size={20} /></button>
        <button><Volume2 size={20} /></button>
        <button className="active-blue"><Palette size={20} /></button>
        <button><Type size={20} /></button>
        <button><Settings size={20} /></button>
      </div>
      
      <div className="display-container">
        {editingTemplateId && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', background: 'var(--timer-color)', padding: '10px', borderRadius: '8px', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', fontWeight: 'bold' }}>
            <span>Editing Template</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setEditingTemplateId(null)} style={{ background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={handleUpdateTemplate} style={{ background: 'white', border: 'none', color: 'var(--timer-color)', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'inherit' }}>Update</button>
            </div>
          </div>
        )}
        {!editingTemplateId && activeTemplate && (
          <div style={{ position: 'absolute', top: '15px', color: 'var(--timer-color)', fontSize: '0.9rem', fontWeight: 'bold' }}>
            ★ {activeTemplate.name}
          </div>
        )}
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
          <label>Voice Note</label>
          <input 
            type="text" 
            placeholder="e.g. Keep your core tight" 
            value={voiceNote} 
            onChange={e => setVoiceNote(e.target.value)}
            style={{flex: 1, background: 'var(--btn-bg)', border: '1px solid #444', color: 'white', padding: '8px', borderRadius: '4px', marginLeft: '10px', fontFamily: 'inherit'}}
          />
        </div>
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
