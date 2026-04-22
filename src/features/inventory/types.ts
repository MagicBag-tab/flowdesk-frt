export interface InventoryProduct {
  id: string;
  nombre: string;
  cantidad: number;
  descripcion: string;
  precio: number;
  stockMinimo: number;
  proveedor?: string | null;
  isactive: boolean;
}

export interface InventoryProductForm {
  id: string;
  nombre: string;
  cantidad: number | null;
  descripcion: string;
  precio: number | null;
  stockMinimo: number | null;
  proveedor?: string | null;
  isactive: boolean;
}
