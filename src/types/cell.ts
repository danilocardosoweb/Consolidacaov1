export interface Cell {
  id: string;
  name: string;
  leader_name: string;
  leader_phone?: string;
  leader_email?: string;
  address: string;
  cep?: string;
  city?: string;
  neighborhood?: string;
  generation?: string;
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