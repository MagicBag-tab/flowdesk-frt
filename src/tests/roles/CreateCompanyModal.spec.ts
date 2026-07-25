import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";

import CreateCompanyModal from "@/features/roles/components/CreateCompanyModal.vue";

vi.mock("@/features/roles/api", () => ({
  createCompany: vi.fn(),
}));

vi.mock("@/services/apiClient", () => ({
  getApiErrorMessage: vi.fn(() => "Error"),
}));

function createWrapper() {
  return mount(CreateCompanyModal, {
    global: {
      stubs: {
        teleport: true,
      },
    },
  });
}

describe("CreateCompanyModal", () => {
  it("renderiza correctamente el modal", () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain("Crear empresa");
    expect(wrapper.text()).toContain("Cancelar");
    expect(wrapper.text()).toContain("Crear empresa");
  });

  it("muestra error cuando el nombre de empresa está vacío", async () => {
    const wrapper = createWrapper();

    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.text()).toContain(
      "El nombre de empresa es obligatorio."
    );
  });

  it("muestra error cuando el correo del administrador está vacío", async () => {
    const wrapper = createWrapper();

    const inputs = wrapper.findAll("input");

    await inputs[0].setValue("Mi Empresa");

    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.text()).toContain(
      "El correo del admin es obligatorio."
    );
  });

  it("muestra error cuando el correo tiene un formato inválido", async () => {
    const wrapper = createWrapper();

    const inputs = wrapper.findAll("input");

    await inputs[0].setValue("Mi Empresa");
    await inputs[1].setValue("correoinvalido");

    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.text()).toContain(
      "Ingresa un correo valido."
    );
  });

  it("muestra error cuando el usuario administrador está vacío", async () => {
    const wrapper = createWrapper();

    const inputs = wrapper.findAll("input");

    await inputs[0].setValue("Mi Empresa");
    await inputs[1].setValue("admin@empresa.com");

    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.text()).toContain(
      "El usuario admin es obligatorio."
    );
  });

  it("emite el evento close al presionar cancelar", async () => {
    const wrapper = createWrapper();

    await wrapper.find(".btn-secondary").trigger("click");

    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("renderiza correctamente el botón crear empresa", () => {
    const wrapper = createWrapper();

    expect(wrapper.find(".btn-primary").exists()).toBe(true);
  });
});