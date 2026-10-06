import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, Save, X } from 'lucide-react';
import TimePickerModal from './TimePickerModal';

const Time12HourPicker = ({ value, onChange, style }) => {
  const [h24, m] = (value || '00:00').split(':').map(Number);
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;

  const handleHour = (e) => {
    let newH12 = parseInt(e.target.value, 10);
    let newH24 = ampm === 'PM' ? (newH12 === 12 ? 12 : newH12 + 12) : (newH12 === 12 ? 0 : newH12);
    onChange(`${newH24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
  };

  const handleMin = (e) => {
    onChange(`${h24.toString().padStart(2, '0')}:${e.target.value.padStart(2, '0')}`);
  };

  const handleAmPm = (e) => {
    let newAmPm = e.target.value;
    let newH24 = h24;
    if (newAmPm === 'AM' && h24 >= 12) newH24 -= 12;
    if (newAmPm === 'PM' && h24 < 12) newH24 += 12;
    onChange(`${newH24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', ...style }}>
      <select value={h12} onChange={handleHour} style={{ background: 'var(--btn-bg)', border: '1px solid #444', color: 'white', padding: '4px', borderRadius: '4px', fontFamily: 'inherit' }}>
        {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
      </select>
      <span>:</span>
      <select value={m.toString().padStart(2, '0')} onChange={handleMin} style={{ background: 'var(--btn-bg)', border: '1px solid #444', color: 'white', padding: '4px', borderRadius: '4px', fontFamily: 'inherit' }}>
        {[...Array(60)].map((_, i) => <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>)}
      </select>
      <select value={ampm} onChange={handleAmPm} style={{ background: 'var(--btn-bg)', border: '1px solid #444', color: 'white', padding: '4px', borderRadius: '4px', fontFamily: 'inherit', marginLeft: '2px' }}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};

export default function RoutinesTab() {
  const [routines, setRoutines] = useState(() => {
    const saved = localStorage.getItem('voiceClockRoutines');
    return saved ? JSON.parse(saved) : [];
  });
  const [editingRoutineId, setEditingRoutineId] = useState(null);
  const [expandedRoutineId, setExpandedRoutineId] = useState(null);
  
  const [customPickerOpen, setCustomPickerOpen] = useState(false);
  const [customPickerTarget, setCustomPickerTarget] = useState(null);

  useEffect(() => {
    localStorage.setItem('voiceClockRoutines', JSON.stringify(routines));
  }, [routines]);

  const addRoutine = () => {
    const newRoutine = {
      id: Date.now().toString(),
      name: 'New Routine',
      enabled: true,
      elements: []
    };
    setRoutines([...routines, newRoutine]);
    setEditingRoutineId(newRoutine.id);
  };

  const deleteRoutine = (id) => {
    setRoutines(routines.filter(r => r.id !== id));
  };

  const addElement = (routineId) => {
    setRoutines(routines.map(r => {
      if (r.id === routineId) {
        return {
          ...r,
          elements: [
            ...r.elements,
            {
              id: Date.now().toString(),
              type: 'voice_reminder',
              time: '08:00',
              repeatInterval: '0',
              endTime: '',
              days: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false },
              text: 'Time for your reminder'
            }
          ]
        };
      }
      return r;
    }));
  };

  const updateElement = (routineId, elementId, field, value) => {
    setRoutines(routines.map(r => {
      if (r.id === routineId) {
        return {
          ...r,
          elements: r.elements.map(e => e.id === elementId ? { ...e, [field]: value } : e)
        };
      }
      return r;
    }));
  };

  const updateElementDay = (routineId, elementId, day, isChecked) => {
    setRoutines(routines.map(r => {
      if (r.id === routineId) {
        return {
          ...r,
          elements: r.elements.map(e => {
            if (e.id === elementId) {
              return { ...e, days: { ...e.days, [day]: isChecked } };
            }
            return e;
          })
        };
      }
      return r;
    }));
  };

  const deleteElement = (routineId, elementId) => {
    setRoutines(routines.map(r => {
      if (r.id === routineId) {
        return { ...r, elements: r.elements.filter(e => e.id !== elementId) };
      }
      return r;
    }));
  };

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <section className="tab-content routines-theme" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="toolbar" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>My Routines</h2>
        <button className="text-btn" onClick={addRoutine} style={{ background: 'var(--routines-color)', color: 'white', padding: '5px 10px', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Plus size={16} /> New Routine
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {routines.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '50px' }}>
            No routines created yet.<br/>Click "New Routine" to get started.
          </div>
        ) : (
          routines.map(routine => (
            <div key={routine.id} style={{ background: 'var(--bg-panel)', borderRadius: '10px', marginBottom: '15px', overflow: 'hidden', border: '1px solid #444' }}>
              <div 
                style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: expandedRoutineId === routine.id ? '#333' : 'transparent' }}
                onClick={() => setExpandedRoutineId(expandedRoutineId === routine.id ? null : routine.id)}
              >
                {editingRoutineId === routine.id ? (
                  <input 
                    type="text" 
                    value={routine.name} 
                    onClick={e => e.stopPropagation()}
                    onChange={e => setRoutines(routines.map(r => r.id === routine.id ? { ...r, name: e.target.value } : r))}
                    style={{ background: '#222', border: '1px solid var(--routines-color)', color: 'white', padding: '5px', borderRadius: '4px', fontSize: '1.1rem', flex: 1, marginRight: '10px' }}
                  />
                ) : (
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{routine.name}</h3>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={e => e.stopPropagation()}>
                  <label className="checkbox-label" style={{ margin: 0 }}>
                    <input 
                      type="checkbox" 
                      checked={routine.enabled} 
                      onChange={e => setRoutines(routines.map(r => r.id === routine.id ? { ...r, enabled: e.target.checked } : r))}
                    />
                    <span className="custom-checkbox routines-check" style={{ width: '18px', height: '18px' }}></span>
                  </label>
                  
                  {editingRoutineId === routine.id ? (
                    <button onClick={() => setEditingRoutineId(null)} style={{ background: 'none', border: 'none', color: 'var(--routines-color)', cursor: 'pointer' }}><Save size={18} /></button>
                  ) : (
                    <button onClick={() => setEditingRoutineId(routine.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Edit2 size={18} /></button>
                  )}
                  <button onClick={() => deleteRoutine(routine.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                  {expandedRoutineId === routine.id ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                </div>
              </div>

              {expandedRoutineId === routine.id && (
                <div style={{ padding: '15px', borderTop: '1px solid #444' }}>
                  {routine.elements.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px' }}>No reminders added yet.</p>
                  ) : (
                    routine.elements.map(el => (
                      <div key={el.id} style={{ background: '#222', padding: '10px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #333' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--routines-color)' }}>Voice Reminder</span>
                          <button onClick={() => deleteElement(routine.id, el.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}><X size={16} /></button>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Start:</span>
                            <Time12HourPicker 
                              value={el.time} 
                              onChange={val => updateElement(routine.id, el.id, 'time', val)}
                            />
                          </div>
                          <input 
                            type="text" 
                            value={el.text} 
                            placeholder="Message to speak"
                            onChange={e => updateElement(routine.id, el.id, 'text', e.target.value)}
                            style={{ width: '100%', background: 'var(--btn-bg)', border: '1px solid #444', color: 'white', padding: '10px', borderRadius: '6px', fontFamily: 'inherit' }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>Repeat:</span>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <select 
                              value={el.repeatInterval || '0'} 
                              onChange={e => {
                                if (e.target.value === 'custom') {
                                  setCustomPickerTarget({ routineId: routine.id, elementId: el.id, currentVal: el.repeatInterval === '0' ? 60 : Math.round((parseFloat(el.repeatInterval) || 0) * 60) });
                                  setCustomPickerOpen(true);
                                } else {
                                  updateElement(routine.id, el.id, 'repeatInterval', e.target.value);
                                }
                              }}
                              style={{ background: 'var(--btn-bg)', border: '1px solid #444', color: 'white', padding: '6px', borderRadius: '4px', fontSize: '0.8rem' }}
                            >
                              <option value="0">None</option>
                              <option value="5">Every 5 mins</option>
                              <option value="10">Every 10 mins</option>
                              <option value="15">Every 15 mins</option>
                              <option value="30">Every 30 mins</option>
                              <option value="60">Every 1 hour</option>
                              <option value="120">Every 2 hours</option>
                              <option value="240">Every 4 hours</option>
                              {!['0','5','10','15','30','60','120','240'].includes(el.repeatInterval) && (
                                <option value={el.repeatInterval}>
                                  {(() => {
                                    const secs = Math.round((parseFloat(el.repeatInterval) || 0) * 60);
                                    return `Custom (${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m ${secs % 60}s)`;
                                  })()}
                                </option>
                              )}
                              <option value="custom">Custom...</option>
                            </select>
                            {!['0','5','10','15','30','60','120','240'].includes(el.repeatInterval) && (
                              <button onClick={() => {
                                setCustomPickerTarget({ routineId: routine.id, elementId: el.id, currentVal: Math.round((parseFloat(el.repeatInterval) || 0) * 60) });
                                setCustomPickerOpen(true);
                              }} style={{ background: 'none', border: 'none', color: 'var(--routines-color)', cursor: 'pointer', marginLeft: '5px' }}>
                                <Edit2 size={14} />
                              </button>
                            )}
                          </div>
                          {el.repeatInterval && el.repeatInterval !== '0' && (
                            <>
                              <span style={{color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '5px'}}>Until:</span>
                              <Time12HourPicker 
                                value={el.endTime || ''} 
                                onChange={val => updateElement(routine.id, el.id, 'endTime', val)}
                              />
                            </>
                          )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          {DAYS.map(day => (
                            <label key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.75rem', color: el.days[day] ? 'var(--routines-color)' : 'var(--text-muted)', cursor: 'pointer' }}>
                              <span>{day}</span>
                              <input 
                                type="checkbox" 
                                checked={el.days[day]} 
                                onChange={e => updateElementDay(routine.id, el.id, day, e.target.checked)}
                                style={{ marginTop: '3px' }}
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                  <button 
                    onClick={() => addElement(routine.id)}
                    style={{ background: 'var(--btn-bg)', color: 'var(--text-main)', border: '1px dashed #555', padding: '8px', borderRadius: '5px', width: '100%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}
                  >
                    <Plus size={16} /> Add Voice Reminder
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <TimePickerModal 
        isOpen={customPickerOpen}
        onClose={() => {
          setCustomPickerOpen(false);
          setCustomPickerTarget(null);
        }}
        initialSeconds={customPickerTarget ? customPickerTarget.currentVal : 0}
        onSave={(totalSeconds) => {
          if (customPickerTarget) {
            // Store as minutes (decimals allowed for seconds)
            const minutes = totalSeconds / 60;
            updateElement(customPickerTarget.routineId, customPickerTarget.elementId, 'repeatInterval', minutes.toString());
          }
        }}
      />
    </section>
  );
}
