import { useState } from 'react';
import { Cloud, UploadCloud, DownloadCloud, X, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

export default function CloudSyncModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleUpload = async () => {
    setLoading(true);
    setMessage('Uploading to cloud...');
    try {
      const routines = localStorage.getItem('voiceClockRoutines') || '[]';
      const stopwatchTemplates = localStorage.getItem('voiceClockStopwatchTemplates') || '[]';
      
      const docRef = doc(db, 'users', 'my-personal-profile');
      await setDoc(docRef, {
        routines: JSON.parse(routines),
        stopwatchTemplates: JSON.parse(stopwatchTemplates),
        lastUpdated: new Date().toISOString()
      });
      setMessage('Successfully uploaded to cloud! ✅');
    } catch (e) {
      console.error(e);
      setMessage('Error uploading to cloud. ❌');
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    setLoading(true);
    setMessage('Downloading from cloud...');
    try {
      const docRef = doc(db, 'users', 'my-personal-profile');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.routines) {
          localStorage.setItem('voiceClockRoutines', JSON.stringify(data.routines));
        }
        if (data.stopwatchTemplates) {
          localStorage.setItem('voiceClockStopwatchTemplates', JSON.stringify(data.stopwatchTemplates));
        }
        setMessage('Successfully downloaded! Refresh the app to see changes. ✅');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMessage('No backup found on the cloud. ❌');
      }
    } catch (e) {
      console.error(e);
      setMessage('Error downloading from cloud. ❌');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '350px', textAlign: 'center' }}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#00d0ff' }}>
          <Cloud size={24} /> Cloud Sync
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Sync your Routines and Stopwatch Templates to your personal Firebase cloud.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button 
            onClick={handleUpload}
            disabled={loading}
            style={{ 
              background: 'var(--btn-bg)', border: '1px solid #444', color: 'white', 
              padding: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' 
            }}
          >
            <UploadCloud size={20} color="#00d0ff" />
            Backup to Cloud
          </button>
          
          <button 
            onClick={handleDownload}
            disabled={loading}
            style={{ 
              background: 'var(--btn-bg)', border: '1px solid #444', color: 'white', 
              padding: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' 
            }}
          >
            <DownloadCloud size={20} color="#00ff88" />
            Restore from Cloud
          </button>
        </div>

        <div style={{ marginTop: '20px', minHeight: '24px', color: 'var(--text-muted)' }}>
          {loading ? <Loader2 size={20} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> : message}
        </div>
        
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
