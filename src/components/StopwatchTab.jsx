import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Check, Bookmark, X } from 'lucide-react';
import { speak, formatSpeechTime } from '../utils/speech';
import { setStopwatchBackgroundState, playSilentAudio } from '../utils/background';
import { NativeTimer } from '../utils/nativeTimer';
import TimePickerModal from './TimePickerModal';
import TemplatesModal from './TemplatesModal';

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
  const [voiceNote, setVoiceNote] = useState("");
  const [voiceNoteSpeak, setVoiceNoteSpeak] = useState(true);
  const [voiceNoteIntervalType, setVoiceNoteIntervalType] = useState('sync'); // 'sync' or 'custom'
  const [voiceNoteIntervalVal, setVoiceNoteIntervalVal] = useState(30000); // ms

  const [pickerConfig, setPickerConfig] = useState({ isOpen: false, type: null, initialVal: 0 });
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [editingTemplateId, setEditingTemplateId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('voiceClock_stopwatchTemplates');
    if (stored) setTemplates(JSON.parse(stored));
  }, []);

  const currentSettings = {
    intervalSpeak,
    intervalVal,
    voiceNote,
    voiceNoteSpeak,
    voiceNoteIntervalType,
    voiceNoteIntervalVal
  };

  const isMatch = (tSettings, current) => {
    return Object.keys(current).every(k => tSettings[k] === current[k]);
  };
  const activeTemplate = templates.find(t => isMatch(t.settings, currentSettings));

  const handleApplyTemplate = (t) => {
    const s = t.settings;
    setIntervalSpeak(s.intervalSpeak ?? true);
    setIntervalVal(s.intervalVal || 30000);
    setVoiceNote(s.voiceNote || "");
    setVoiceNoteSpeak(s.voiceNoteSpeak ?? true);
    setVoiceNoteIntervalType(s.voiceNoteIntervalType || 'sync');
    setVoiceNoteIntervalVal(s.voiceNoteIntervalVal || 30000);
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
    localStorage.setItem('voiceClock_stopwatchTemplates', JSON.stringify(updatedTemplates));
    setEditingTemplateId(null);
  };

  const handleResetToDefault = () => {
    setIntervalSpeak(true);
    setIntervalVal(30000);
    setVoiceNote("");
    setVoiceNoteSpeak(true);
    setVoiceNoteIntervalType('sync');
    setVoiceNoteIntervalVal(30000);
  };

  const swRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedWhenPausedRef = useRef(0);
  const wakeLockRef = useRef(null);
  const tickListenerRef = useRef(null);

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
    let lastSpokenNoteInterval = null;

    if (isRunning) {
      requestWakeLock();
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now() - elapsedWhenPausedRef.current;
      }
      
      const setupTimer = async () => {
        if (tickListenerRef.current) {
            await tickListenerRef.current.remove();
        }
        tickListenerRef.current = await NativeTimer.addListener('onTick', () => {
          const now = Date.now();
          const currentMs = now - startTimeRef.current;
          setMs(currentMs);

          let shouldSpeakTime = false;
          let currentIntervalTarget = 0;
          if (intervalSpeak && intervalVal > 0) {
            currentIntervalTarget = Math.floor(currentMs / intervalVal) * intervalVal;
            if (currentIntervalTarget > 0 && currentIntervalTarget !== lastSpokenInterval && currentMs >= currentIntervalTarget) {
              shouldSpeakTime = true;
            }
          }

          let shouldSpeakNote = false;
          let currentNoteIntervalTarget = 0;
          if (voiceNoteSpeak && voiceNote.trim()) {
            if (voiceNoteIntervalType === 'sync') {
              shouldSpeakNote = shouldSpeakTime;
            } else if (voiceNoteIntervalType === 'custom' && voiceNoteIntervalVal > 0) {
              currentNoteIntervalTarget = Math.floor(currentMs / voiceNoteIntervalVal) * voiceNoteIntervalVal;
              if (currentNoteIntervalTarget > 0 && currentNoteIntervalTarget !== lastSpokenNoteInterval && currentMs >= currentNoteIntervalTarget) {
                shouldSpeakNote = true;
              }
            }
          }

          if (shouldSpeakTime || shouldSpeakNote) {
            let msg = "";
            if (shouldSpeakTime) {
              msg += formatSpeechTime(Math.floor(currentIntervalTarget / 1000));
              lastSpokenInterval = currentIntervalTarget;
            }
            if (shouldSpeakNote) {
              msg += (msg ? ". " : "") + voiceNote.trim();
              if (voiceNoteIntervalType === 'custom') {
                lastSpokenNoteInterval = currentNoteIntervalTarget;
              }
            }
            speak(msg);
          }
        });
        await NativeTimer.start({ ms: 50 });
      };
      setupTimer();
    } else {
      NativeTimer.stop();
      if (tickListenerRef.current) {
          tickListenerRef.current.remove();
          tickListenerRef.current = null;
      }
      releaseWakeLock();
      if (ms > 0) {
        elapsedWhenPausedRef.current = ms;
      }
    }
    return () => {
      NativeTimer.stop();
      if (tickListenerRef.current) {
          tickListenerRef.current.remove();
          tickListenerRef.current = null;
      }
      releaseWakeLock();
    };
  }, [isRunning, intervalSpeak, intervalVal]);

  useEffect(() => {
    // Only update notification roughly once per second to avoid spamming the Android UI thread
    const hPart = Math.floor(ms / 3600000);
    const mPart = Math.floor((ms / 60000) % 60);
    const sPart = Math.floor((ms / 1000) % 60);
    const formatted = `${hPart > 0 ? hPart + 'h ' : ''}${mPart > 0 ? mPart + 'm ' : ''}${sPart}s`;
    
    setStopwatchBackgroundState(isRunning, formatted);
  }, [isRunning, Math.floor(ms / 1000)]);

  const toggleSw = () => {
    if (!isRunning && ms === 0) {
       startTimeRef.current = null;
       elapsedWhenPausedRef.current = 0;
    }
    if (!isRunning) playSilentAudio();
    setIsRunning(!isRunning);
  }

  const reset = () => {
    setIsRunning(false);
    setMs(0);
    setLaps([]);
    setLastLapMs(0);
    startTimeRef.current = null;
    elapsedWhenPausedRef.current = 0;
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

  const handleSavePicker = (val) => {
    if (pickerConfig.type === 'interval') setIntervalVal(val * 1000);
    else if (pickerConfig.type === 'noteInterval') setVoiceNoteIntervalVal(val * 1000);
  };

  return (
    <section className="tab-content pink-theme">
      <TimePickerModal 
        isOpen={pickerConfig.isOpen}
        title="Time"
        initialSeconds={Math.floor((pickerConfig.type === 'noteInterval' ? voiceNoteIntervalVal : intervalVal) / 1000)}
        onClose={() => setPickerConfig({ ...pickerConfig, isOpen: false })}
        onSave={handleSavePicker}
      />
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        type="stopwatch"
        currentSettings={currentSettings}
        onApply={handleApplyTemplate}
        templates={templates}
        setTemplates={setTemplates}
        activeTemplateId={activeTemplate?.id}
        onEditSettings={handleEditSettings}
      />
      {editingTemplateId ? (
        <div style={{ background: 'var(--stopwatch-color)', padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', fontWeight: 'bold' }}>
          <span>Editing Template</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setEditingTemplateId(null)} style={{ background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            <button onClick={handleUpdateTemplate} style={{ background: 'white', border: 'none', color: 'var(--stopwatch-color)', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'inherit' }}>Update</button>
          </div>
        </div>
      ) : (
        <div className="toolbar" style={{justifyContent: 'flex-start', alignItems: 'center'}}>
          <button onClick={() => setIsTemplatesOpen(true)}><Bookmark size={20} /></button>
          
          {activeTemplate && (
            <div style={{ color: 'var(--stopwatch-color)', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '10px' }}>
              <span>★ {activeTemplate.name}</span>
              <button onClick={handleResetToDefault} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}
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
            <input type="checkbox" checked={voiceNoteSpeak} onChange={e => setVoiceNoteSpeak(e.target.checked)} />
            <span className="custom-checkbox pink-check"><Check size={14} /></span> Voice Note
          </label>
          <input 
            type="text" 
            placeholder="e.g. Keep your core tight" 
            value={voiceNote} 
            onChange={e => setVoiceNote(e.target.value)}
            style={{flex: 1, background: 'var(--btn-bg)', border: '1px solid #444', color: 'white', padding: '8px', borderRadius: '4px', marginLeft: '10px', fontFamily: 'inherit'}}
          />
        </div>
        {voiceNoteSpeak && (
          <div className="setting-row">
            <label style={{marginLeft: '25px', color: 'var(--text-muted)'}}>Note Interval</label>
            <select 
              value={voiceNoteIntervalType} 
              onChange={e => setVoiceNoteIntervalType(e.target.value)}
              style={{background: 'var(--btn-bg)', border: '1px solid #444', color: 'white', padding: '4px', borderRadius: '4px', fontFamily: 'inherit', marginLeft: '10px'}}
            >
              <option value="sync">Sync with Time Interval</option>
              <option value="custom">Custom Interval</option>
            </select>
            {voiceNoteIntervalType === 'custom' && (
              <button 
                className="text-btn flex-btn" 
                onClick={() => setPickerConfig({isOpen: true, type: 'noteInterval', initialVal: voiceNoteIntervalVal})}
                style={{background: 'var(--btn-bg)', padding: '5px 10px', borderRadius: '5px', border: '1px solid #444', fontSize: '0.9rem', marginLeft: '10px'}}
              >
                {formatShortTime(voiceNoteIntervalVal)} <span style={{fontSize: '0.7em'}}>▼</span>
              </button>
            )}
          </div>
        )}
        <div className="setting-row">
          <label className="checkbox-label">
            <input type="checkbox" checked={intervalSpeak} onChange={e => setIntervalSpeak(e.target.checked)} />
            <span className="custom-checkbox pink-check"><Check size={14} /></span> Interval
          </label>
          <button 
            className="text-btn" 
            style={{background: 'var(--btn-bg)', padding: '5px 10px', borderRadius: '5px', border: '1px solid #444', fontSize: '0.9rem'}}
            onClick={() => setPickerConfig({isOpen: true, type: 'interval', initialVal: intervalVal})}
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
