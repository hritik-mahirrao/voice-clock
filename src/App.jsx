import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { Menu, Clock as ClockIcon, Hourglass, Timer as TimerIcon } from 'lucide-react';
import ClockTab from './components/ClockTab';
import TimerTab from './components/TimerTab';
import StopwatchTab from './components/StopwatchTab';
import Sidebar from './components/Sidebar';
import SpeechSettingsModal from './components/SpeechSettingsModal';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('timer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSpeechModalOpen, setIsSpeechModalOpen] = useState(false);

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
      </main>
    </div>
  );
}

export default App;
