import { useState } from 'react';
import { Volume2, RotateCcw, Activity, Droplet, Play } from 'lucide-react';
import { getSpeechSettings, setSpeechSettings, speak } from '../utils/speech';

export default function SpeechSettingsModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState(getSpeechSettings());

  if (!isOpen) return null;

  const handleReset = () => {
    const defaultSettings = { rate: 1, pitch: 1 };
    setSettings(defaultSettings);
    setSpeechSettings(1, 1);
  };

  const handleSave = () => {
    setSpeechSettings(settings.rate, settings.pitch);
    speak("Settings saved");
    onClose();
  };

  const handlePreview = () => {
    const synth = window.speechSynthesis;
    if (synth.speaking) {
        synth.cancel();
    }
    const utterThis = new SpeechSynthesisUtterance("1, 2, 3");
    utterThis.rate = settings.rate;
    utterThis.pitch = settings.pitch;
    synth.speak(utterThis);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <Volume2 size={24} />
            <h2>Speech Engine Setting</h2>
          </div>
          <button className="text-btn flex-btn" onClick={handleReset}>
            <RotateCcw size={16} /> RESET
          </button>
        </div>

        <div className="modal-body">
          <div className="slider-group">
            <label>Speed Of Speech</label>
            <div className="slider-row">
              <Activity size={20} color="var(--text-muted)" />
              <input 
                type="range" 
                min="0.1" 
                max="2" 
                step="0.1" 
                value={settings.rate}
                onChange={(e) => setSettings({...settings, rate: parseFloat(e.target.value)})}
                onMouseUp={handlePreview}
                onTouchEnd={handlePreview}
              />
            </div>
          </div>

          <div className="slider-group">
            <label>Tone Of Speech</label>
            <div className="slider-row">
              <Droplet size={20} color="var(--text-muted)" />
              <input 
                type="range" 
                min="0.1" 
                max="2" 
                step="0.1" 
                value={settings.pitch}
                onChange={(e) => setSettings({...settings, pitch: parseFloat(e.target.value)})}
                onMouseUp={handlePreview}
                onTouchEnd={handlePreview}
              />
            </div>
          </div>
          
          <div style={{display: 'flex', justifyContent: 'center', marginTop: '15px'}}>
            <button className="text-btn flex-btn" onClick={handlePreview} style={{background: 'var(--timer-color)', color: 'white'}}>
              <Play size={16} fill="white" /> PREVIEW SOUND
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="text-btn" onClick={onClose}>CANCEL</button>
          <button className="text-btn" onClick={handleSave}>OK</button>
        </div>
      </div>
    </div>
  );
}
