import type { 
    InventoryProduct 
} from './types';
import { apiClient } from '@/services/apiClient';   

interface InventoryProductResponse {
    id: string;
    nombre: string;
    descripcion?: string | null;
    precio?: number | string | null;
    precio_venta?: number | string | null;
    cantidad?: number | string | null;
    stock_actual?: number | string | null;
    stockMinimo?: number | string | null;
    stock_minimo?: number | string | null;
    proveedor?: string | { nombre?: string | null } | null;
    is_active?: boolean | null;
}

function toNumber(value: number | string | null | undefined): number {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}

function getProviderName(provider: InventoryProductResponse['proveedor']): string | null {
    if (!provider) return null;
    if (typeof provider === 'string') return provider;
    return provider.nombre ?? null;
}

function normalizeInventoryProduct(product: InventoryProductResponse): InventoryProduct {
    return {
        id: product.id,
        nombre: product.nombre,
        descripcion: product.descripcion ?? '',
        precio: toNumber(product.precio ?? product.precio_venta),
        cantidad: toNumber(product.cantidad ?? product.stock_actual),
        stockMinimo: toNumber(product.stockMinimo ?? product.stock_minimo),
        proveedor: getProviderName(product.proveedor),
        is_active: product.is_active ?? true,
    };
}

export function fetchInventoryProducts(): Promise<InventoryProduct[]> {
    return apiClient.request<InventoryProductResponse[]>('/api/v1/inventory/products', {
        method: 'GET',
        auth: true
    }).then(products => products.map(normalizeInventoryProduct));
}
