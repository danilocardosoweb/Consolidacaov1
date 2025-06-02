import { Tables, Enums } from "@/integrations/supabase/types";

export interface Visitor extends Tables<'visitors'> {
  metadata: {
    gender?: Enums<'gender_type'>;
    ageGroup?: Enums<'age_group_type'>;
    // Add other expected metadata fields here with their types
    [key: string]: any; // Allow other properties not explicitly defined
  } | null;
  // Keep other fields that are directly in the visitors table
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
