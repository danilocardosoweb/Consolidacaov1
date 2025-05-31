export interface Visitor {
  id: string;
  name: string;
  gender: string;
  email: string;
  phone: string;
  cep: string;
  neighborhood: string;
  city: string;
  ageGroup: string;
  generation: string;
  howDidYouHear: string;
  inviterName: string;
  consolidatorName: string;
  notes: string;
  visitDate: string;
  firstTime: boolean;
  status: 'pending' | 'contacted' | 'converted' | 'not_interested' | 'active';
  createdAt: string;
  updatedAt: string;
}

export interface VisitorTableProps {
  onNavigate: (view: string) => void;
}

export interface VisitorFormProps {
  onSuccess?: () => void;
  initialData?: Partial<Visitor>;
  onCancel?: () => void;
}

export interface VisitorDetailsModalProps {
  visitor: Visitor | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface EditVisitorModalProps {
  visitor: Visitor | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedVisitor: Omit<Visitor, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export interface DeleteVisitorModalProps {
  visitor: Visitor | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (visitorId: string) => void;
}
