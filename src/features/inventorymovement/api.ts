import { apiClient } from '@/services/apiClient';

export interface InventoryMovement {
  id: string;
  producto_id: string;
  usuario_id: string | null;
  tipo_movimiento: string;
  fecha: string;
  cantidad: number;
  stock_anterior: number;
  stock_resultante: number;
  motivo: string | null;
  referencia_tipo: string | null;
  referencia_id: string | null;
}

export type MovementType =
  | 'entrada_compra' | 'entrada_manual' | 'ajuste_positivo' | 'devolucion_cliente'
  | 'salida_venta' | 'salida_manual' | 'ajuste_negativo' | 'devolucion_proveedor';

export interface CreateMovementPayload {
  producto_id: string;
  tipo_movimiento: MovementType;
  cantidad: number;
  motivo?: string;
}

export function fetchMovements(productId?: string): Promise<InventoryMovement[]> {
  const path = productId
    ? `/api/v1/inventory/movements?product_id=${productId}`
    : '/api/v1/inventory/movements';
  return apiClient.request<InventoryMovement[]>(path, { method: 'GET', auth: true });
}

export function createMovement(payload: CreateMovementPayload): Promise<InventoryMovement> {
  return apiClient.request<InventoryMovement>('/api/v1/inventory/movements', {
    method: 'POST', auth: true, body: payload,
  });
}

export const INBOUND_TYPES = [
  'entrada_compra', 'entrada_manual', 'ajuste_positivo', 'devolucion_cliente',
];

export function isInbound(tipo: string): boolean {
  return INBOUND_TYPES.includes(tipo);
}