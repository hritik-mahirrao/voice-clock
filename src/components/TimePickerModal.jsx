import { useState, useEffect, useRef } from 'react';
import { Hourglass } from 'lucide-react';

const PickerColumn = ({ val, setVal, max, label }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState("");
  const scrollRef = useRef(null);
  const isScrolling = useRef(false);
  const scrollTimeout = useRef(null);

  useEffect(() => {
    if (scrollRef.current && !isEditing && !isScrolling.current) {
      scrollRef.current.scrollTop = val * 40;
    }
  }, [val, isEditing]);

  const handleScroll = (e) => {
    isScrolling.current = true;
    clearTimeout(scrollTimeout.current);
    
    const newVal = Math.round(e.target.scrollTop / 40);
    if (newVal >= 0 && newVal <= max && newVal !== val) {
      setVal(newVal);
    }
    
    scrollTimeout.current = setTimeout(() => {
      isScrolling.current = false;
    }, 150);
  };

  const handleEditSubmit = () => {
    setIsEditing(false);
    let p = parseInt(editVal, 10);
    if (isNaN(p)) p = 0;
    if (p < 0) p = 0;
    if (p > max) p = max;
    setVal(p);
  };

  return (
    <div className="picker-col-wrapper" style={{display: 'flex', alignItems: 'center', position: 'relative'}}>
      <div className="picker-highlight"></div>
      
      {isEditing ? (
        <div className="picker-col">
          <div className="picker-pad"></div>
          <input 
            type="number" 
            className="picker-item picker-input current" 
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={e => e.key === 'Enter' && handleEditSubmit()}
            autoFocus
          />
          <div className="picker-pad"></div>
        </div>
      ) : (
        <div 
          className="picker-col"
          onScroll={handleScroll}
          ref={scrollRef}
        >
          <div className="picker-pad"></div>
          {Array.from({length: max + 1}).map((_, i) => (
            <div 
              key={i} 
              className={`picker-item ${i === val ? 'current' : ''}`} 
              onClick={() => {
                if (i === val) {
                  setIsEditing(true);
                  setEditVal(val.toString());
                } else {
                  scrollRef.current.scrollTo({top: i * 40, behavior: 'smooth'});
                }
              }}
            >
              {i}
            </div>
          ))}
          <div className="picker-pad"></div>
        </div>
      )}
      <span className="picker-label">{label}</span>
    </div>
  );
};

export default function TimePickerModal({ isOpen, onClose, onSave, title="Time", initialSeconds=0 }) {
  const [h, setH] = useState(0);
  const [m, setM] = useState(0);
  const [s, setS] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setH(Math.floor(initialSeconds / 3600));
      setM(Math.floor((initialSeconds % 3600) / 60));
      setS(initialSeconds % 60);
    }
  }, [isOpen, initialSeconds]);

  if (!isOpen) return null;

  const handleSave = () => {
    const total = (h * 3600) + (m * 60) + s;
    onSave(total);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content time-picker-modal">
        <div className="modal-header" style={{borderBottom: 'none'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <Hourglass size={20} />
            <h2>{title}</h2>
          </div>
        </div>

        <div className="modal-body picker-body">
          <div className="picker-container">
            <PickerColumn val={h} setVal={setH} max={99} label="h" />
            <PickerColumn val={m} setVal={setM} max={59} label="m" />
            <PickerColumn val={s} setVal={setS} max={59} label="s" />
          </div>
        </div>

        <div className="modal-footer" style={{borderTop: 'none'}}>
          <button className="text-btn" onClick={onClose}>CANCEL</button>
          <button className="text-btn" onClick={handleSave}>OK</button>
        </div>
      </div>
    </div>
  );
}
