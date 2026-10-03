import { 
  Gift, ThumbsUp, Share2, Grid, Volume2, History, HelpCircle, Shield 
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, onOpenSpeechSettings }) {
  return (
    <>
      {/* Overlay to close sidebar by clicking outside */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="app-icon">
            <span style={{ fontSize: '2rem' }}>⏱️</span>
          </div>
          <div className="app-title">
            <h3>Speaking Timer Stopwatch</h3>
            <span>(v1.0.0)</span>
          </div>
        </div>

        <div className="sidebar-menu">
          <div className="menu-section">
            <div className="menu-title">Share</div>
            <button className="menu-item"><Gift size={20} /> Get Premium</button>
            <button className="menu-item"><ThumbsUp size={20} /> Rate</button>
            <button className="menu-item"><Share2 size={20} /> Share app</button>
            <button className="menu-item"><Grid size={20} /> More apps</button>
          </div>

          <div className="menu-section">
            <div className="menu-title">Settings</div>
            <button 
              className="menu-item" 
              onClick={() => { onClose(); onOpenSpeechSettings(); }}
            >
              <Volume2 size={20} /> Speech Engine Setting
            </button>
          </div>

          <div className="menu-section">
            <div className="menu-title">History</div>
            <button className="menu-item"><History size={20} /> History</button>
          </div>

          <div className="menu-section">
            <div className="menu-title">Help</div>
            <button className="menu-item"><HelpCircle size={20} /> Open source</button>
            <button className="menu-item"><Shield size={20} /> Privacy Policy</button>
          </div>
        </div>
      </div>
    </>
  );
}
