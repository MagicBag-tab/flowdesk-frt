export type ProductsFeatureStatus = 'placeholder';

export interface ProductsFeaturePlaceholder {
  status: ProductsFeatureStatus;
  summary: string;
}

export const productsFeaturePlaceholder: ProductsFeaturePlaceholder = {
  status: 'placeholder',
  summary: 'El modulo de productos queda fuera de esta entrega inicial y se conectara cuando exista contrato backend.',
};
