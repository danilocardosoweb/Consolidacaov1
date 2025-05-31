
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Visitor } from '@/types/visitor';

interface DeleteVisitorModalProps {
  visitor: Visitor | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (visitorId: string) => void;
}

const DeleteVisitorModal: React.FC<DeleteVisitorModalProps> = ({
  visitor,
  isOpen,
  onClose,
  onDelete
}) => {
  if (!visitor) return null;

  const handleDelete = () => {
    onDelete(visitor.id);
    toast.success('Visitante excluído com sucesso!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-playfair text-slate-800 flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <span>Confirmar Exclusão</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-slate-700">
              Você tem certeza que deseja excluir o visitante{' '}
              <strong className="text-slate-900">{visitor.name}</strong>?
            </p>
            <p className="text-sm text-red-600 mt-2">
              Esta ação não pode ser desfeita. Todos os dados relacionados a este visitante serão permanentemente removidos.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-semibold text-slate-800 mb-2">Dados que serão excluídos:</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Nome: {visitor.name}</li>
              <li>• Email: {visitor.email}</li>
              <li>• Telefone: {visitor.phone}</li>
              <li>• Histórico de visitas</li>
              <li>• Informações de contato</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            className="flex-1 bg-red-600 text-white hover:bg-red-700"
          >
            Excluir Visitante
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteVisitorModal;
