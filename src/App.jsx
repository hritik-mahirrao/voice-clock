import React, { useState, useEffect } from 'react';
import { BackgroundMode } from '@anuradev/capacitor-background-mode';
import Dashboard from './components/Dashboard';
import RoutineList from './components/RoutineList';
import RoutineEditor from './components/RoutineEditor';
import { initEngine, startEngine, stopEngine } from './utils/routineEngine';

function App() {
  const [routines, setRoutines] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, list, edit
  const [editingRoutine, setEditingRoutine] = useState(null);

  useEffect(() => {
    const loadRoutines = async () => {
      const saved = localStorage.getItem('mindfulness_routines');
      if (saved) {
        setRoutines(JSON.parse(saved));
      }
    };
    loadRoutines();

    const setupBackground = async () => {
      try {
        await BackgroundMode.enable();
        await BackgroundMode.disableWebViewOptimizations();
      } catch (e) {
        console.log("Background mode not available");
      }
    };
    setupBackground();
  }, []);

  useEffect(() => {
    localStorage.setItem('mindfulness_routines', JSON.stringify(routines));
    initEngine(routines);
    startEngine();
    return () => stopEngine();
  }, [routines]);

  const saveRoutine = (routine) => {
    if (routine.id) {
      setRoutines(routines.map(r => r.id === routine.id ? routine : r));
    } else {
      setRoutines([...routines, { ...routine, id: Date.now().toString() }]);
    }
    setCurrentView('list');
    setEditingRoutine(null);
  };

  const deleteRoutine = (id) => {
    setRoutines(routines.filter(r => r.id !== id));
  };

  const toggleRoutine = (id) => {
    setRoutines(routines.map(r => {
      if (r.id === id) return { ...r, active: !r.active };
      return r;
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col">
      <header className="p-4 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight text-orange-500">MindfulTTS</h1>
        <nav className="flex space-x-2">
          <button 
            className={`px-3 py-1 rounded-md text-sm ${currentView === 'dashboard' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
            onClick={() => setCurrentView('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`px-3 py-1 rounded-md text-sm ${currentView === 'list' || currentView === 'edit' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
            onClick={() => setCurrentView('list')}
          >
            Routines
          </button>
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {currentView === 'dashboard' && <Dashboard routines={routines} />}
        {currentView === 'list' && (
          <RoutineList 
            routines={routines} 
            onEdit={(r) => { setEditingRoutine(r); setCurrentView('edit'); }}
            onDelete={deleteRoutine}
            onToggle={toggleRoutine}
            onNew={() => { setEditingRoutine(null); setCurrentView('edit'); }}
          />
        )}
        {currentView === 'edit' && (
          <RoutineEditor 
            initialRoutine={editingRoutine} 
            onSave={saveRoutine} 
            onCancel={() => setCurrentView('list')} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
