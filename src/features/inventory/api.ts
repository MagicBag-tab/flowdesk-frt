import type { 
    InventoryProduct 
} from './types';
import { apiClient } from '@/services/apiClient';   

export function fetchInventoryProducts(): Promise<InventoryProduct[]> {
    return apiClient.request<InventoryProduct[]>('/api/v1/inventory/products', {
        method: 'GET',
        auth: true
    });
}