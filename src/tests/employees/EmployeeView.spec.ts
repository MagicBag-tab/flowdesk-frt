import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";

import EmployeeView from "@/features/employees/views/EmployeeView.vue";

vi.mock("@/features/employees/api", () => ({
  fetchEmployees: vi.fn(() => Promise.resolve([])),
}));

vi.mock("@/services/apiClient", () => ({
  getApiErrorMessage: vi.fn(() => "Error"),
}));

vi.mock("@/features/employees/components/AddEmployeeModal.vue", () => ({
  default: {
    template: "<div>Mock AddEmployeeModal</div>",
  },
}));

function createWrapper() {
  return mount(EmployeeView);
}

describe("EmployeeView", () => {

  it("renderiza correctamente la vista de empleados", async () => {
    const wrapper = createWrapper();
    await nextTick();

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain("Empleados");
    expect(wrapper.text()).toContain("Agregar empleado");
  });

  it("muestra mensaje cuando no hay empleados", async () => {
    const wrapper = createWrapper();

    await nextTick();
    await Promise.resolve();
    await nextTick();

    expect(wrapper.text()).toContain(
        "No hay empleados registrados aún."
    );
  });

  it("abre el modal al presionar agregar empleado", async () => {
    const wrapper = createWrapper();
    await nextTick();

    await wrapper.find(".btn-add").trigger("click");

    expect(wrapper.text()).toContain("Mock AddEmployeeModal");
  });

});