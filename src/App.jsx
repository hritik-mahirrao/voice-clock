import { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { Menu, Clock as ClockIcon, Hourglass, Timer as TimerIcon, ListRestart } from 'lucide-react';
import ClockTab from './components/ClockTab';
import TimerTab from './components/TimerTab';
import StopwatchTab from './components/StopwatchTab';
import RoutinesTab from './components/RoutinesTab';
import Sidebar from './components/Sidebar';
import SpeechSettingsModal from './components/SpeechSettingsModal';
import { speak } from './utils/speech';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('timer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSpeechModalOpen, setIsSpeechModalOpen] = useState(false);
  const lastSpokenRoutineRef = useRef(null);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      CapacitorUpdater.notifyAppReady();
      const checkUpdate = async () => {
        try {
          const response = await fetch('https://hritik-mahirrao.github.io/voice-clock/update.json?t=' + Date.now());
          const data = await response.json();
          
          const current = await CapacitorUpdater.current();
          if (current.version !== data.version) {
             const version = await CapacitorUpdater.download({
                url: data.url,
                version: data.version
             });
             await CapacitorUpdater.set({ id: version.id });
          }
        } catch (e) {
          console.error("OTA Update Check Failed:", e);
          alert("OTA Update Failed: " + e.message);
        }
      };
      checkUpdate();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      
      const currentTotalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      const timeKey = `${currentDay}-${currentTotalSeconds}`;
      
      if (lastSpokenRoutineRef.current !== timeKey) {
        const saved = localStorage.getItem('voiceClockRoutines');
        if (saved) {
          try {
            const routines = JSON.parse(saved);
            for (const routine of routines) {
              if (routine.enabled && routine.elements) {
                for (const el of routine.elements) {
                  if (el.days[currentDay] && el.text) {
                    let shouldSpeak = false;
                    
                    if (el.repeatInterval && parseFloat(el.repeatInterval) > 0) {
                      const [startH, startM] = el.time.split(':').map(Number);
                      const startSeconds = startH * 3600 + startM * 60;
                      const intervalSecs = Math.round(parseFloat(el.repeatInterval) * 60);
                      
                      let endSeconds = 24 * 3600; // default to midnight
                      if (el.endTime) {
                         const [endH, endM] = el.endTime.split(':').map(Number);
                         endSeconds = endH * 3600 + endM * 60;
                      }
                      
                      if (currentTotalSeconds >= startSeconds && currentTotalSeconds <= endSeconds) {
                          // Allow a 10 second window since setInterval runs every 10s
                          const diff = currentTotalSeconds - startSeconds;
                          if (diff % intervalSecs < 10) {
                              // Ensure we don't speak multiple times within the same interval window
                              const intervalIndex = Math.floor(diff / intervalSecs);
                              const spokenKey = `${routine.id}-${el.id}-${currentDay}-${intervalIndex}`;
                              
                              if (lastSpokenRoutineRef.current !== spokenKey) {
                                shouldSpeak = true;
                                lastSpokenRoutineRef.current = spokenKey;
                              }
                          }
                      }
                    } else {
                      if (el.time === currentTimeStr && now.getSeconds() < 10) {
                        shouldSpeak = true;
                      }
                    }

                    if (shouldSpeak) {
                      speak(el.text, true);
                    }
                  }
                }
              }
            }
          } catch(e) {}
        }
      }
    }, 10000); // check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onOpenSpeechSettings={() => setIsSpeechModalOpen(true)}
      />
      
      <SpeechSettingsModal 
        isOpen={isSpeechModalOpen} 
        onClose={() => setIsSpeechModalOpen(false)} 
      />

      <header className="top-nav">
        <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        <span style={{ fontSize: '10px', color: '#666', marginLeft: '5px' }}>v2</span>
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'clock' ? 'active' : ''}`}
            onClick={() => setActiveTab('clock')}
          >
            <ClockIcon size={18} /> Clock
          </button>
          <button 
            className={`tab-btn ${activeTab === 'timer' ? 'active' : ''}`}
            onClick={() => setActiveTab('timer')}
          >
            <Hourglass size={18} /> Timer
          </button>
          <button 
            className={`tab-btn ${activeTab === 'stopwatch' ? 'active' : ''}`}
            onClick={() => setActiveTab('stopwatch')}
          >
            <TimerIcon size={18} /> Stopwatch
          </button>
          <button 
            className={`tab-btn ${activeTab === 'routines' ? 'active' : ''}`}
            onClick={() => setActiveTab('routines')}
          >
            <ListRestart size={18} /> Routines
          </button>
        </div>
      </header>

      <main className="content-area">
        <div style={{ display: activeTab === 'clock' ? 'flex' : 'none', flex: 1, flexDirection: 'column' }}>
          <ClockTab />
        </div>
        <div style={{ display: activeTab === 'timer' ? 'flex' : 'none', flex: 1, flexDirection: 'column' }}>
          <TimerTab />
        </div>
        <div style={{ display: activeTab === 'stopwatch' ? 'flex' : 'none', flex: 1, flexDirection: 'column' }}>
          <StopwatchTab />
        </div>
        <div style={{ display: activeTab === 'routines' ? 'flex' : 'none', flex: 1, flexDirection: 'column' }}>
          <RoutinesTab />
        </div>
      </main>
    </div>
  );
}

export default App;
