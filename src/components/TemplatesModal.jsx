import { useState, useEffect } from 'react';
import { Bookmark, Plus, X, Edit2, Check } from 'lucide-react';

export default function TemplatesModal({ isOpen, onClose, type, currentSettings, onApply }) {
  const [templates, setTemplates] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const storageKey = `voiceClock_${type}Templates`;

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setTemplates(JSON.parse(stored));
      }
    }
  }, [isOpen, storageKey]);

  if (!isOpen) return null;

  const saveTemplates = (newTemplates) => {
    setTemplates(newTemplates);
    localStorage.setItem(storageKey, JSON.stringify(newTemplates));
  };

  const handleSaveCurrent = () => {
    const newTemplate = {
      id: Date.now().toString(),
      name: `Template ${templates.length + 1}`,
      settings: currentSettings
    };
    saveTemplates([...templates, newTemplate]);
  };

  const handleRemove = (id) => {
    saveTemplates(templates.filter(t => t.id !== id));
  };

  const handleApply = (settings) => {
    onApply(settings);
    onClose();
  };

  const startRename = (template) => {
    setEditingId(template.id);
    setEditName(template.name);
  };

  const saveRename = (id) => {
    const updated = templates.map(t => t.id === id ? { ...t, name: editName } : t);
    saveTemplates(updated);
    setEditingId(null);
  };

  const color = type === 'timer' ? 'var(--timer-color)' : 'var(--stopwatch-color)';

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{maxWidth: '400px'}}>
        <div className="modal-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <Bookmark size={20} />
            <h2>{type === 'timer' ? 'Timer' : 'Stopwatch'} Templates</h2>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="modal-body" style={{maxHeight: '400px', overflowY: 'auto'}}>
          {templates.length === 0 ? (
            <p style={{color: '#aaa', textAlign: 'center', margin: '20px 0'}}>No templates saved yet.</p>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              {templates.map(t => (
                <div key={t.id} style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '10px',
                  borderRadius: '8px'
                }}>
                  {editingId === t.id ? (
                    <div style={{display: 'flex', gap: '5px', flex: 1, marginRight: '10px'}}>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        style={{
                          background: '#111', 
                          border: '1px solid #444', 
                          color: 'white', 
                          padding: '5px',
                          borderRadius: '4px',
                          width: '100%',
                          outline: 'none',
                          fontFamily: 'inherit'
                        }}
                        autoFocus
                      />
                      <button className="icon-btn" onClick={() => saveRename(t.id)}><Check size={18} color={color}/></button>
                    </div>
                  ) : (
                    <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <span 
                        style={{cursor: 'pointer', flex: 1, fontWeight: '600'}} 
                        onClick={() => handleApply(t.settings)}
                      >
                        {t.name}
                      </span>
                      <button className="icon-btn" onClick={() => startRename(t)}><Edit2 size={16} /></button>
                    </div>
                  )}
                  
                  {editingId !== t.id && (
                    <button className="icon-btn" onClick={() => handleRemove(t.id)}><X size={18} color="#ff5277"/></button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="modal-footer" style={{borderTop: '1px solid #444', padding: '15px'}}>
          <button 
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: color,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: '600',
              fontFamily: 'inherit',
              fontSize: '1rem'
            }}
            onClick={handleSaveCurrent}
          >
            <Plus size={20} /> Save Current Settings as Template
          </button>
        </div>
      </div>
    </div>
  );
}
