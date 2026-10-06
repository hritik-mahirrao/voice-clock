import { useState } from 'react';

export default function RoutinesTab() {
  return (
    <section className="tab-content routines-theme" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '20px', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '10px' }}>Routines</h2>
      <p style={{ color: 'var(--text-muted)' }}>
        This tab is ready! What kind of routines would you like to build? (e.g. Sequential workout timers, Pomodoro flows, etc.)
      </p>
    </section>
  );
}
