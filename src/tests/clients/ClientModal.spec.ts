import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import ClientView from "@/features/clients/views/ClientView.vue";

vi.mock("@/features/clients/api", () => ({
  fetchClients: vi.fn(() => Promise.resolve([])),
}));

vi.mock("@/services/apiClient", () => ({
  getApiErrorMessage: vi.fn(() => "Error"),
}));

vi.mock("@/features/clients/components/ClientModal.vue", () => ({
  default: { template: "<div>Modal Cliente</div>" },
}));

describe("ClientView", () => {

  it("renderiza la vista de clientes", async () => {
    const wrapper = mount(ClientView);
    await nextTick();

    expect(wrapper.text()).toContain("Clientes");
    expect(wrapper.text()).toContain("Nuevo Cliente");
  });

  it("muestra mensaje cuando no hay clientes", async () => {
    const wrapper = mount(ClientView);

    await Promise.resolve();
    await nextTick();

    expect(wrapper.text()).toContain("No hay clientes encontrados.");
  });

  it("abre el modal para crear cliente", async () => {
    const wrapper = mount(ClientView);

    await wrapper.find(".btn-add").trigger("click");

    expect(wrapper.text()).toContain("Modal Cliente");
  });

});