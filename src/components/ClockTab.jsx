import { useState, useEffect } from 'react';

export default function ClockTab() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const h = String(time.getHours()).padStart(2, '0');
  const m = String(time.getMinutes()).padStart(2, '0');
  const s = String(time.getSeconds()).padStart(2, '0');
  
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  const dateStr = time.toLocaleDateString(undefined, options);

  return (
    <section className="tab-content clock-display-container display-container" style={{height: '100%'}}>
      <div className="time-display">
        {h}<span className="colon">:</span>{m}<span className="colon">:</span>{s}
      </div>
      <div className="date-display">{dateStr}</div>
    </section>
  );
}
