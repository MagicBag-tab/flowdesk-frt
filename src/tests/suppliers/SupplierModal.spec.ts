import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";

import SupplierModal from "@/features/suppliers/components/SupplierModal.vue";

vi.mock("@/features/suppliers/api", () => ({
  createSupplier: vi.fn(() => Promise.resolve({})),
  updateSupplier: vi.fn(() => Promise.resolve({})),
}));

vi.mock("@/services/apiClient", () => ({
  getApiErrorMessage: vi.fn(() => "Error"),
}));

describe("SupplierModal", () => {

  it("renderiza el modal", () => {
    const wrapper = mount(SupplierModal);

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain("Nuevo Proveedor");
    expect(wrapper.text()).toContain("Crear Proveedor");
  });

  it("valida que el nombre sea obligatorio", async () => {
    const wrapper = mount(SupplierModal);

    await wrapper.find("form").trigger("submit");
    await nextTick();

    expect(wrapper.text()).toContain(
      "El nombre del proveedor es obligatorio."
    );
  });

  it("valida el correo incorrecto", async () => {
    const wrapper = mount(SupplierModal);

    await wrapper
      .find('input[type="text"]')
      .setValue("Proveedor");

    await wrapper
      .find('input[type="email"]')
      .setValue("correo-malo");

    await wrapper.find("form").trigger("submit");
    await nextTick();

    expect(wrapper.text()).toContain(
      "El correo electrónico no tiene un formato válido."
    );
  });

  it("cierra el modal al cancelar", async () => {
    const wrapper = mount(SupplierModal);

    await wrapper.find(".btn-secondary").trigger("click");

    expect(wrapper.emitted("close")).toBeTruthy();
  });

});