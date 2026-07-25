import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/services/authStorage", () => ({
  loadStoredSession: vi.fn(),
  saveStoredSession: vi.fn(),
  clearStoredSession: vi.fn(),
  createSession: vi.fn(),
}));

import * as authStorage from "@/services/authStorage";
import { appStore } from "@/stores/app.store";

describe("appStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appStore.clearSession();
  });

  it("inicia sin una sesión autenticada", () => {
    expect(appStore.isAuthenticated.value).toBe(false);
    expect(appStore.accessToken).toBeNull();
  });

  it("establece una sesión correctamente", () => {
    vi.mocked(authStorage.createSession).mockReturnValue({
      accessToken: "token123",
      claims: {
        role: "admin",
        schema_name: "empresa",
        company_id: "1",
      },
    } as never);

    appStore.setSession({} as never);

    expect(appStore.isAuthenticated.value).toBe(true);
    expect(appStore.accessToken).toBe("token123");
    expect(authStorage.saveStoredSession).toHaveBeenCalled();
  });

  it("elimina la sesión correctamente", () => {
    vi.mocked(authStorage.createSession).mockReturnValue({
      accessToken: "token123",
      claims: {},
    } as never);

    appStore.setSession({} as never);

    appStore.clearSession();

    expect(appStore.isAuthenticated.value).toBe(false);
    expect(appStore.accessToken).toBeNull();
    expect(authStorage.clearStoredSession).toHaveBeenCalled();
  });

  it("obtiene correctamente el rol", () => {
    vi.mocked(authStorage.createSession).mockReturnValue({
      accessToken: "token123",
      claims: {
        role: "manager",
      },
    } as never);

    appStore.setSession({} as never);

    expect(appStore.roleName.value).toBe("manager");
  });

  it("obtiene correctamente el schema", () => {
    vi.mocked(authStorage.createSession).mockReturnValue({
      accessToken: "token123",
      claims: {
        schema_name: "empresa_demo",
      },
    } as never);

    appStore.setSession({} as never);

    expect(appStore.schemaName.value).toBe("empresa_demo");
  });

  it("obtiene correctamente el companyId", () => {
    vi.mocked(authStorage.createSession).mockReturnValue({
      accessToken: "token123",
      claims: {
        company_id: "25",
      },
    } as never);

    appStore.setSession({} as never);

    expect(appStore.companyId.value).toBe("25");
  });
});