import { useState, useEffect } from 'react';
import { Hourglass } from 'lucide-react';

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

  const pad = (num) => String(num).padStart(1, '0'); // The screenshot doesn't pad with 0s except single digits, actually it shows "0", "9", "59"
  // Wait, screenshot shows 9, 0, 1. So no padding.

  const renderColumn = (val, setVal, max) => {
    const prev = val - 1 < 0 ? max : val - 1;
    const next = val + 1 > max ? 0 : val + 1;

    return (
      <div className="picker-col">
        <div className="picker-item prev" onClick={() => setVal(prev)}>{prev}</div>
        <div className="picker-item current">
          {val}
        </div>
        <div className="picker-item next" onClick={() => setVal(next)}>{next}</div>
      </div>
    );
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
            {renderColumn(h, setH, 99)}
            <span className="picker-label">h</span>
            {renderColumn(m, setM, 59)}
            <span className="picker-label">m</span>
            {renderColumn(s, setS, 59)}
            <span className="picker-label">s</span>
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
