import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";

import SuppliersView from "@/features/suppliers/views/SuppliersView.vue";
import { fetchSuppliers } from "@/features/suppliers/api";

vi.mock("@/features/suppliers/api", () => ({
  fetchSuppliers: vi.fn(),
  toggleSupplierStatus: vi.fn(),
}));

vi.mock("@/services/apiClient", () => ({
  getApiErrorMessage: vi.fn(() => "Error al cargar proveedores"),
}));

vi.mock("@/features/suppliers/components/SupplierModal.vue", () => ({
  default: {
    template: "<div>Mock SupplierModal</div>",
  },
}));

const mockSuppliers = [
  {
    id: "1",
    nombre: "Distribuidora Central",
    telefono: "55551234",
    correo: "contacto@central.com",
    direccion: "Zona 1",
    is_active: true,
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
  },
  {
    id: "2",
    nombre: "Papelería Nacional",
    telefono: "55555678",
    correo: "ventas@papeleria.com",
    direccion: "Zona 10",
    is_active: true,
    created_at: "2026-08-02",
    updated_at: "2026-08-02",
  },
];

function createWrapper() {
  return mount(SuppliersView);
}

describe("SuppliersView", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza correctamente la vista de proveedores", async () => {

    vi.mocked(fetchSuppliers).mockResolvedValue([]);

    const wrapper = createWrapper();

    await nextTick();
    await Promise.resolve();
    await nextTick();

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain("Proveedores");
    expect(wrapper.text()).toContain("Nuevo Proveedor");

  });

  it("muestra mensaje cuando no hay proveedores", async () => {

    vi.mocked(fetchSuppliers).mockResolvedValue([]);

    const wrapper = createWrapper();

    await nextTick();
    await Promise.resolve();
    await nextTick();

    expect(wrapper.text()).toContain(
      "No hay proveedores encontrados."
    );

  });

  it("muestra los proveedores obtenidos", async () => {

    vi.mocked(fetchSuppliers).mockResolvedValue(mockSuppliers);

    const wrapper = createWrapper();

    await nextTick();
    await Promise.resolve();
    await nextTick();

    expect(wrapper.text()).toContain("Distribuidora Central");
    expect(wrapper.text()).toContain("Papelería Nacional");

  });

  it("muestra los datos del primer proveedor", async () => {

    vi.mocked(fetchSuppliers).mockResolvedValue(mockSuppliers);

    const wrapper = createWrapper();

    await nextTick();
    await Promise.resolve();
    await nextTick();

    expect(wrapper.text()).toContain("Distribuidora Central");
    expect(wrapper.text()).toContain("55551234");
    expect(wrapper.text()).toContain("contacto@central.com");
    expect(wrapper.text()).toContain("Zona 1");

  });

  it("permite seleccionar otro proveedor", async () => {

    vi.mocked(fetchSuppliers).mockResolvedValue(mockSuppliers);

    const wrapper = createWrapper();

    await nextTick();
    await Promise.resolve();
    await nextTick();

    const proveedores = wrapper.findAll(".supplier-item");

    expect(proveedores.length).toBe(2);

    await proveedores[1].trigger("click");

    expect(wrapper.text()).toContain("Papelería Nacional");
    expect(wrapper.text()).toContain("55555678");
    expect(wrapper.text()).toContain("ventas@papeleria.com");

  });

  it("abre el modal al presionar nuevo proveedor", async () => {

    vi.mocked(fetchSuppliers).mockResolvedValue([]);

    const wrapper = createWrapper();

    await nextTick();
    await Promise.resolve();
    await nextTick();

    await wrapper.find(".btn-add").trigger("click");

    expect(wrapper.text()).toContain("Mock SupplierModal");

  });

  it("abre el modal para editar un proveedor", async () => {

    vi.mocked(fetchSuppliers).mockResolvedValue(mockSuppliers);

    const wrapper = createWrapper();

    await nextTick();
    await Promise.resolve();
    await nextTick();

    await wrapper.find(".btn-icon-action").trigger("click");

    expect(wrapper.text()).toContain("Mock SupplierModal");

  });

  it("muestra mensaje de error si falla la carga", async () => {

    vi.mocked(fetchSuppliers).mockRejectedValue(
      new Error("Error")
    );

    const wrapper = createWrapper();

    await nextTick();
    await Promise.resolve();
    await nextTick();

    expect(wrapper.text()).toContain(
      "Error al cargar proveedores"
    );

  });

});