import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";

import ImportExcelModal from "@/features/inventory/components/ImportExcelModal.vue";

vi.mock("@/features/inventory/import", () => ({
  importProductsExcel: vi.fn(),
}));

vi.mock("@/services/apiClient", () => ({
  getApiErrorMessage: vi.fn(() => "Error"),
}));

function createWrapper() {
  return mount(ImportExcelModal, {
    global: {
      stubs: {
        teleport: true,
      },
    },
  });
}

describe("ImportExcelModal", () => {
  it("renderiza correctamente el modal", () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain("Importar productos desde Excel");
  });

  it("muestra los botones principales", () => {
    const wrapper = createWrapper();

    expect(wrapper.text()).toContain("Vista previa");
    expect(wrapper.text()).toContain("Cancelar");
  });

  it("renderiza un input para seleccionar archivos", () => {
    const wrapper = createWrapper();

    const input = wrapper.find('input[type="file"]');

    expect(input.exists()).toBe(true);
  });

  it("renderiza la zona para cargar archivos", () => {
    const wrapper = createWrapper();

    expect(wrapper.text()).toContain("Arrastra tu archivo aquí");
    expect(wrapper.text()).toContain("haz clic para buscar");
  });
});