import { useState, useEffect } from 'react';
import { Volume2, RotateCcw, Activity, Droplet, Play, Mic } from 'lucide-react';
import { getSpeechSettings, setSpeechSettings, speak } from '../utils/speech';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

export default function SpeechSettingsModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState(getSpeechSettings());
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const loadVoices = async () => {
      try {
        const result = await TextToSpeech.getSupportedVoices();
        setVoices(result.voices || []);
      } catch (e) {
        console.error("Failed to load voices", e);
      }
    };
    loadVoices();
  }, []);

  if (!isOpen) return null;

  const handleReset = () => {
    const defaultSettings = { rate: 1, pitch: 1, voiceURI: '' };
    setSettings(defaultSettings);
    setSpeechSettings(1, 1, '');
  };

  const handleSave = () => {
    setSpeechSettings(settings.rate, settings.pitch, settings.voiceURI);
    speak("Settings saved");
    onClose();
  };

  const handlePreview = async () => {
    try {
      await TextToSpeech.stop();
      let speakOptions = {
        text: "1, 2, 3",
        rate: settings.rate,
        pitch: settings.pitch,
      };
      if (settings.voiceURI !== '') {
        speakOptions.voice = parseInt(settings.voiceURI, 10);
      }
      await TextToSpeech.speak(speakOptions);
    } catch (e) {
      console.error("Preview failed:", e);
    }
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
            <label>Voice / Accent</label>
            <div className="slider-row" style={{marginBottom: '15px'}}>
              <Mic size={20} color="var(--text-muted)" />
              <select 
                value={settings.voiceURI}
                onChange={(e) => {
                  setSettings({...settings, voiceURI: e.target.value});
                  setTimeout(() => handlePreview(), 100);
                }}
                style={{flex: 1, background: 'var(--btn-bg)', border: '1px solid #444', color: 'white', padding: '8px', borderRadius: '4px', fontFamily: 'inherit'}}
              >
                <option value="">Default (Auto-select Best)</option>
                {voices.map((v, i) => (
                  <option key={v.voiceURI} value={i}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          </div>

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
