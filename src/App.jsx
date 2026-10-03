import { useState } from 'react';
import { Menu, Clock as ClockIcon, Hourglass, Timer as TimerIcon } from 'lucide-react';
import ClockTab from './components/ClockTab';
import TimerTab from './components/TimerTab';
import StopwatchTab from './components/StopwatchTab';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('timer');

  return (
    <div className="app-container">
      <header className="top-nav">
        <button className="menu-btn"><Menu size={24} /></button>
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
        {activeTab === 'clock' && <ClockTab />}
        {activeTab === 'timer' && <TimerTab />}
        {activeTab === 'stopwatch' && <StopwatchTab />}
      </main>
    </div>
  );
}

export default App;
