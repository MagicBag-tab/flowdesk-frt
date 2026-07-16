import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";

import SetPasswordView from "@/features/auth/views/SetPasswordView.vue";

vi.mock("vue-router", () => ({
  RouterLink: {
    template: "<a><slot /></a>",
  },
  useRoute: () => ({
    query: {
      token: "token-prueba",
    },
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/features/auth/api", () => ({
  setPassword: vi.fn(),
}));

vi.mock("@/services/apiClient", () => ({
  getApiErrorMessage: vi.fn(() => "Error"),
}));

function createWrapper() {
  return mount(SetPasswordView);
}

describe("SetPasswordView", () => {

  it("renderiza correctamente el formulario", async () => {
    const wrapper = createWrapper();
    await nextTick();

    expect(wrapper.exists()).toBe(true);

    expect(wrapper.find("#password").exists()).toBe(true);
    expect(wrapper.find("#confirm-password").exists()).toBe(true);

    expect(wrapper.find("button[type='submit']").exists()).toBe(true);

    expect(wrapper.text()).toContain("Volver al login");
  });

  it("muestra error cuando la contraseña está vacía", async () => {
    const wrapper = createWrapper();
    await nextTick();

    await wrapper.find("form").trigger("submit.prevent");
    await nextTick();

    expect(wrapper.text()).toContain(
      "La contraseña es obligatoria."
    );
  });

  it("muestra error cuando la contraseña tiene menos de 6 caracteres", async () => {
    const wrapper = createWrapper();
    await nextTick();

    await wrapper.find("#password").setValue("123");
    await wrapper.find("#confirm-password").setValue("123");

    await wrapper.find("form").trigger("submit.prevent");
    await nextTick();

    expect(wrapper.text()).toContain(
      "La contraseña debe tener al menos 6 caracteres."
    );
  });

  it("muestra error cuando la contraseña supera los 20 caracteres", async () => {
    const wrapper = createWrapper();
    await nextTick();

    await wrapper.find("#password").setValue("123456789012345678901");
    await wrapper.find("#confirm-password").setValue("123456789012345678901");

    await wrapper.find("form").trigger("submit.prevent");
    await nextTick();

    expect(wrapper.text()).toContain(
      "La contraseña no puede exceder 20 caracteres."
    );
  });

  it("muestra error cuando la confirmación está vacía", async () => {
    const wrapper = createWrapper();
    await nextTick();

    await wrapper.find("#password").setValue("123456");

    await wrapper.find("form").trigger("submit.prevent");
    await nextTick();

    expect(wrapper.text()).toContain(
      "Debes confirmar la contraseña."
    );
  });

  it("muestra error cuando las contraseñas no coinciden", async () => {
    const wrapper = createWrapper();
    await nextTick();

    await wrapper.find("#password").setValue("123456");
    await wrapper.find("#confirm-password").setValue("654321");

    await wrapper.find("form").trigger("submit.prevent");
    await nextTick();

    expect(wrapper.text()).toContain(
      "Las contraseñas no coinciden."
    );
  });

  it("permite mostrar y ocultar la contraseña", async () => {
    const wrapper = createWrapper();
    await nextTick();

    const toggleButtons = wrapper.findAll(".input-password-toggle");

    expect(wrapper.find("#password").attributes("type")).toBe("password");

    await toggleButtons[0].trigger("click");

    expect(wrapper.find("#password").attributes("type")).toBe("text");

    await toggleButtons[0].trigger("click");

    expect(wrapper.find("#password").attributes("type")).toBe("password");
  });

  it("permite mostrar y ocultar la confirmación", async () => {
    const wrapper = createWrapper();
    await nextTick();

    const toggleButtons = wrapper.findAll(".input-password-toggle");

    expect(wrapper.find("#confirm-password").attributes("type")).toBe("password");

    await toggleButtons[1].trigger("click");

    expect(wrapper.find("#confirm-password").attributes("type")).toBe("text");

    await toggleButtons[1].trigger("click");

    expect(wrapper.find("#confirm-password").attributes("type")).toBe("password");
  });

});