import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { nextTick } from "vue";

import SuperAdminView from "@/features/roles/views/SuperAdminView.vue";

vi.mock("@/features/employees/api", () => ({
  fetchEmployees: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/services/apiClient", () => ({
  ApiError: class extends Error {
    status = 404;
  },
  getApiErrorMessage: vi.fn(() => "Error"),
}));

vi.mock(
  "@/features/roles/components/CreateCompanyModal.vue",
  () => ({
    default: {
      name: "CreateCompanyModal",
      template: "<div data-testid='create-company-modal'></div>",
    },
  })
);

function createWrapper() {
  sessionStorage.clear();

  return mount(SuperAdminView);
}

describe("SuperAdminView", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("renderiza correctamente la vista", () => {
    const wrapper = createWrapper();

    expect(wrapper.text()).toContain("Manejo de cuentas");
    expect(wrapper.text()).toContain("Crear empresa");
    expect(wrapper.text()).toContain("Negocios");
    expect(wrapper.text()).toContain("Usuarios");
  });

  it("muestra mensaje cuando no existen empresas", () => {
    const wrapper = createWrapper();

    expect(wrapper.text()).toContain(
      "No hay empresas creadas en esta sesion."
    );
  });

  it("abre el modal para crear empresa", async () => {
    const wrapper = createWrapper();

    await wrapper.find(".btn-add").trigger("click");

    expect(
      wrapper.find("[data-testid='create-company-modal']").exists()
    ).toBe(true);
  });

  it("permite cambiar a la pestaña usuarios", async () => {
    const wrapper = createWrapper();

    const botones = wrapper.findAll(".btn");

    await botones[1].trigger("click");

    expect(botones[1].classes()).toContain("activo");
  });

  it("muestra mensaje cuando no hay usuarios", async () => {
    const wrapper = createWrapper();

    const botones = wrapper.findAll(".btn");

    await botones[1].trigger("click");

    await flushPromises();
    await nextTick();

    expect(wrapper.text()).toContain("No hay usuarios para mostrar.");
  });
});