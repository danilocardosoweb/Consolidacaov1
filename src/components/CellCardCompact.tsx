import React from 'react';
interface Cell {
  id: string;
  name: string;
  leader_name: string;
  leader_phone?: string;
  leader_email?: string;
  address: string;
  lat: number;
  lng: number;
  meeting_day: string;
  meeting_time: string;
  capacity: number;
  current_members: number;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}
import { Users, Edit, Trash2 } from 'lucide-react';

interface CellCardCompactProps {
  cell: Cell;
  onEdit: (cell: Cell) => void;
  onDelete: (id: string) => void;
}

const CellCardCompact: React.FC<CellCardCompactProps> = ({ cell, onEdit, onDelete }) => {
  return (
    <div className="p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] flex items-center justify-center text-white font-semibold">
            {cell.leader_name && cell.leader_name.trim() ? (
              cell.leader_name
                .split(' ')
                .filter((_, i, arr) => i === 0 || i === arr.length - 1)
                .map(n => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
            ) : (
              <Users className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-slate-800">{cell.name}</h3>
            <p className="text-sm text-slate-600">{cell.leader_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${cell.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {cell.is_active ? 'Ativa' : 'Inativa'}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(cell); }}
            className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 hover:text-[#94C6EF] transition-colors"
            title="Editar célula"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(cell.id); }}
            className="p-1.5 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Excluir célula"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CellCardCompact;
