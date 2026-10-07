import React from 'react';
import { Plus, Edit2, Trash2, Power } from 'lucide-react';

export default function RoutineList({ routines, onEdit, onDelete, onToggle, onNew }) {
  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-white">Your Routines</h2>
        <button 
          onClick={onNew}
          className="bg-orange-600 hover:bg-orange-500 text-white p-2 rounded-full shadow-lg"
        >
          <Plus size={20} />
        </button>
      </div>

      {routines.length === 0 ? (
        <div className="text-center py-10 text-zinc-500">
          <p>No routines yet.</p>
          <p className="text-sm mt-2">Click + to create your first mindfulness routine.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {routines.map(routine => (
            <div key={routine.id} className={`bg-zinc-900 border ${routine.active ? 'border-orange-500/50' : 'border-zinc-800'} rounded-xl p-4 transition-colors`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-white font-medium">{routine.name}</h3>
                  <div className="text-xs text-zinc-400 mt-1">
                    {routine.days?.join(', ').toUpperCase()} • {routine.startTime} to {routine.endTime}
                  </div>
                </div>
                <button 
                  onClick={() => onToggle(routine.id)}
                  className={`p-2 rounded-full ${routine.active ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-800 text-zinc-500'}`}
                >
                  <Power size={18} />
                </button>
              </div>
              
              <p className="text-sm text-zinc-300 line-clamp-2 mt-3 bg-zinc-950 p-2 rounded">
                "{routine.message}"
              </p>
              
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-zinc-800">
                <span className="text-xs font-medium text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                  Every {routine.intervalMinutes}m
                </span>
                
                <div className="flex space-x-3">
                  <button onClick={() => onEdit(routine)} className="text-zinc-400 hover:text-white">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => onDelete(routine.id)} className="text-zinc-400 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
