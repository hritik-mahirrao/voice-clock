import React, { useState, useEffect } from 'react';
import { getNextRunTime } from '../utils/routineEngine';

export default function Dashboard({ routines }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeRoutines = routines.filter(r => r.active);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 text-center">
        <h2 className="text-zinc-400 text-sm font-medium mb-1">Active Routines</h2>
        <div className="text-4xl font-light text-white">{activeRoutines.length}</div>
      </div>

      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-orange-400 text-sm">
        <strong className="block mb-1">Battery Optimization Tip</strong>
        For reliable background TTS playback, please go to Android Settings &gt; Apps &gt; MindfulTTS &gt; Battery and set it to <b>Unrestricted</b>.
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-3">Upcoming Executions</h3>
        {activeRoutines.length === 0 ? (
          <div className="text-zinc-500 text-sm text-center py-8">No active routines scheduled.</div>
        ) : (
          <div className="space-y-3">
            {activeRoutines.map(routine => {
              const nextRun = getNextRunTime(routine.id);
              let countdown = "Waiting for interval...";
              if (nextRun) {
                const diffMs = nextRun - now;
                if (diffMs > 0) {
                  const m = Math.floor(diffMs / 60000);
                  const s = Math.floor((diffMs % 60000) / 1000);
                  countdown = `in ${m}m ${s}s`;
                } else {
                  countdown = "Running now...";
                }
              }

              return (
                <div key={routine.id} className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex justify-between items-center">
                  <div className="overflow-hidden">
                    <div className="text-white font-medium truncate">{routine.name || "Unnamed Routine"}</div>
                    <div className="text-xs text-zinc-400 truncate">
                      {routine.startTime} - {routine.endTime} | Every {routine.intervalMinutes}m
                    </div>
                  </div>
                  <div className="text-sm font-mono text-orange-400 shrink-0 ml-4">
                    {countdown}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
