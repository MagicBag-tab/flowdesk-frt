import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";

import RegisterCompanyView from "@/features/auth/views/RegisterCompanyView.vue";

vi.mock("vue-router", () => ({
  RouterLink: {
    template: "<a><slot /></a>",
  },
}));

vi.mock("@/services/apiClient", () => ({
  getApiErrorMessage: vi.fn(() => "Error"),
}));

function createWrapper() {
  return mount(RegisterCompanyView);
}

describe("RegisterCompanyView", () => {
  it("renderiza correctamente el formulario de registro", () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);

    expect(wrapper.find("#company-name").exists()).toBe(true);
    expect(wrapper.find("#admin-username").exists()).toBe(true);
    expect(wrapper.find("#admin-email").exists()).toBe(true);

    expect(wrapper.find("button[type='submit']").exists()).toBe(true);

    expect(wrapper.text()).toContain("Volver al login");
  });

  it("muestra error cuando el nombre de la empresa está vacío", async () => {
    const wrapper = createWrapper();

    await wrapper.find("#admin-username").setValue("Administrador");
    await wrapper.find("#admin-email").setValue("admin@empresa.com");

    await wrapper.find("form").trigger("submit.prevent");
    await nextTick();

    expect(wrapper.text()).toContain(
      "El nombre de la empresa es obligatorio."
    );
  });

  it("muestra error cuando el administrador está vacío", async () => {
    const wrapper = createWrapper();

    await wrapper.find("#company-name").setValue("FlowDesk");
    await wrapper.find("#admin-email").setValue("admin@empresa.com");

    await wrapper.find("form").trigger("submit.prevent");
    await nextTick();

    expect(wrapper.text()).toContain(
      "Debes indicar el usuario administrador."
    );
  });

  it("muestra error cuando el correo está vacío", async () => {
    const wrapper = createWrapper();

    await wrapper.find("#company-name").setValue("FlowDesk");
    await wrapper.find("#admin-username").setValue("Administrador");

    await wrapper.find("form").trigger("submit.prevent");
    await nextTick();

    expect(wrapper.text()).toContain(
      "El correo administrador es obligatorio."
    );
  });

  it("muestra error cuando el correo tiene un formato inválido", async () => {
    const wrapper = createWrapper();

    await wrapper.find("#company-name").setValue("FlowDesk");
    await wrapper.find("#admin-username").setValue("Administrador");
    await wrapper.find("#admin-email").setValue("correo");

    await wrapper.find("form").trigger("submit.prevent");
    await nextTick();

    expect(wrapper.text()).toContain(
      "Ingresa un correo valido."
    );
  });






  
});