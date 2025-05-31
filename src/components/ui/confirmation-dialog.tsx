import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { Button } from './button';
import Modal from './modal';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: (confirmed: boolean) => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'success' | 'warning' | 'danger';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info'
}) => {
  const iconSize = 24;
  
  const icons = {
    info: <Info size={iconSize} className="text-blue-500" />,
    success: <CheckCircle2 size={iconSize} className="text-green-500" />,
    warning: <AlertTriangle size={iconSize} className="text-blue-500" />,
    danger: <AlertCircle size={iconSize} className="text-red-500" />
  };
  
  const buttonVariants = {
    info: 'bg-[#94C6EF] hover:bg-[#7db4db]',
    success: 'bg-green-500 hover:bg-green-600',
    warning: 'bg-amber-500 hover:bg-amber-600',
    danger: 'bg-red-500 hover:bg-red-600'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title=""
      size="sm"
      showCloseButton={false}
    >
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
          {icons[type]}
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            {message}
          </p>
        </div>
        
        <div className="mt-6 flex justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose(false)}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border-slate-300 hover:border-slate-400"
          >
            {cancelText}
          </Button>
          
          <Button
            type="button"
            onClick={() => onClose(true)}
            className={`px-4 py-2 text-sm font-medium text-white ${buttonVariants[type]} transition-colors duration-200`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
