import { useState, useEffect, useRef } from 'react';
import { Hourglass } from 'lucide-react';

const PickerColumn = ({ val, setVal, max, label }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState("");
  
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const startY = useRef(0);
  const startVal = useRef(val);

  const prev = val - 1 < 0 ? max : val - 1;
  const next = val + 1 > max ? 0 : val + 1;

  const handlePointerDown = (e) => {
    if (isEditing) return;
    isDragging.current = true;
    hasDragged.current = false;
    startY.current = e.clientY;
    startVal.current = val;
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const dy = startY.current - e.clientY;
    if (Math.abs(dy) > 5) {
        hasDragged.current = true;
    }
    const ticks = Math.round(dy / 25);
    let newVal = startVal.current + ticks;
    while (newVal < 0) newVal += (max + 1);
    newVal = newVal % (max + 1);
    if (newVal !== val) {
      setVal(newVal);
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    e.target.releasePointerCapture(e.pointerId);
  };

  const handleCurrentClick = () => {
    if (hasDragged.current) return;
    setIsEditing(true);
    setEditVal(val.toString());
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
    <div className="picker-col-wrapper" style={{display: 'flex', alignItems: 'center'}}>
      <div 
        className="picker-col"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none' }}
      >
        <div className="picker-item prev" onClick={() => !hasDragged.current && setVal(prev)}>{prev}</div>
        
        {isEditing ? (
          <input 
            type="number" 
            className="picker-item current picker-input" 
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={e => e.key === 'Enter' && handleEditSubmit()}
            autoFocus
          />
        ) : (
          <div className="picker-item current" onClick={handleCurrentClick}>
            {val}
          </div>
        )}

        <div className="picker-item next" onClick={() => !hasDragged.current && setVal(next)}>{next}</div>
      </div>
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
