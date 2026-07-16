import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import LoginView from "@/features/auth/views/LoginView.vue";

// Mock
vi.mock("vue-router", () => ({
  RouterLink: {
    template: "<a><slot /></a>",
  },
  useRouter: () => ({
    push: vi.fn(),
  }),
  useRoute: () => ({
    query: {},
  }),
}));

vi.mock("@/features/auth/api", () => ({
  loginWithPassword: vi.fn(),
}));

vi.mock("@/stores/app.store", () => ({
  appStore: {
    setSession: vi.fn(),
    clearSession: vi.fn(),
    roleName: {
      value: "admin",
    },
  },
}));

vi.mock("@/utils/roles", () => ({
  resolveHomeByRole: vi.fn(() => "/inventory"),
  isValidRole: vi.fn(() => true),
}));

vi.mock("@/services/apiClient", () => ({
  getApiErrorMessage: vi.fn(() => "Error"),
}));


describe("LoginView", () => {

  it("renderiza correctamente el formulario de login", () => {
    const wrapper = mount(LoginView);

    expect(wrapper.exists()).toBe(true);

    expect(wrapper.find("#email").exists()).toBe(true);
    expect(wrapper.find("#password").exists()).toBe(true);

    const button = wrapper.find("button[type='submit']");
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain("Iniciar Sesión");

    expect(wrapper.text()).toContain("Registrar empresa");
    expect(wrapper.text()).toContain("¿Olvidaste tu contraseña?");
  });

  it("muestra errores cuando el formulario está vacío", async () => {
    const wrapper = mount(LoginView);

    await wrapper.find("form").trigger("submit.prevent");
    await nextTick();

    expect(wrapper.text()).toContain("El correo es obligatorio.");
    expect(wrapper.text()).toContain("La contraseña es obligatoria.");
  });

  it("muestra error cuando el correo no tiene un formato válido", async () => {
    const wrapper = mount(LoginView);

    await wrapper.find("#email").setValue("correoinvalido");
    await wrapper.find("#password").setValue("123456");

    await wrapper.find("form").trigger("submit.prevent");
    await nextTick();

    expect(wrapper.text()).toContain("Ingresa un correo valido.");
  });

  it("muestra error cuando la contraseña tiene menos de 6 caracteres", async () => {
    const wrapper = mount(LoginView);

    await wrapper.find("#email").setValue("usuario@correo.com");
    await wrapper.find("#password").setValue("123");

    await wrapper.find("form").trigger("submit.prevent");
    await nextTick();

    expect(wrapper.text()).toContain(
        "La contraseña debe tener al menos 6 caracteres."
    );
  });

  it("muestra error cuando la contraseña supera los 20 caracteres", async () => {
    const wrapper = mount(LoginView);

    await wrapper.find("#email").setValue("usuario@correo.com");
    await wrapper.find("#password").setValue("123456789012345678901");

    await wrapper.find("form").trigger("submit.prevent");
    await nextTick();

    expect(wrapper.text()).toContain(
        "La contraseña no puede exceder 20 caracteres."
    );
  });

  it("permite mostrar y ocultar la contraseña", async () => {
    const wrapper = mount(LoginView);

    const passwordInput = wrapper.find("#password");

    // Inicialmente debe ser password
    expect(passwordInput.attributes("type")).toBe("password");

    // Botón para mostrar contraseña
    const toggleButton = wrapper.find(".input-password-toggle");

    await toggleButton.trigger("click");

    // Ahora debe ser text
    expect(wrapper.find("#password").attributes("type")).toBe("text");

    // Segundo click

    await toggleButton.trigger("click");

    expect(wrapper.find("#password").attributes("type")).toBe("password");
  });

});