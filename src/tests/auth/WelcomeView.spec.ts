import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";

import WelcomeView from "@/features/auth/views/WelcomeView.vue";

const mockPush = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

function createWrapper() {
  return mount(WelcomeView);
}

describe("WelcomeView", () => {

  it("renderiza correctamente la vista", () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);

    expect(wrapper.text()).toContain("¡Bienvenido a Flowdesk!");
    expect(wrapper.text()).toContain("Ya puedes iniciar sesión con tu cuenta.");
  });

  it("muestra el botón para iniciar sesión", () => {
    const wrapper = createWrapper();

    const button = wrapper.find("button");

    expect(button.exists()).toBe(true);
    expect(button.text()).toContain("Iniciar sesión");
  });

  it("redirige al login cuando se presiona el botón", async () => {
    const wrapper = createWrapper();

    await wrapper.find("button").trigger("click");

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("solo existe un botón principal", () => {
    const wrapper = createWrapper();

    expect(wrapper.findAll("button")).toHaveLength(1);
  });

});