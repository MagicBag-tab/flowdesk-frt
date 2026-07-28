export interface Client {
  id: string;
  nombre: string;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  nombre: string;
  telefono: string;
  correo: string;
  direccion: string;
}

export interface CreateClientPayload {
  nombre: string;
  telefono?: string | null;
  correo?: string | null;
  direccion?: string | null;
}

export interface UpdateClientPayload {
  nombre?: string;
  telefono?: string | null;
  correo?: string | null;
  direccion?: string | null;
}

export interface UpdateClientStatusPayload {
  is_active: boolean;
}
