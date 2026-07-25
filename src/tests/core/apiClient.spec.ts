import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/services/env", () => ({
  appEnv: {
    hasApiBaseUrl: true,
    apiBaseUrl: "http://localhost:8000",
    apiBaseUrlError: null,
  },
}));

vi.mock("@/stores/app.store", () => ({
  appStore: {
    accessToken: "token123",
  },
}));

import {
  apiClient,
  ApiError,
  getApiErrorMessage,
} from "@/services/apiClient";

describe("ApiError", () => {
  it("crea correctamente una instancia", () => {
    const error = new ApiError(404, "No encontrado");

    expect(error.status).toBe(404);
    expect(error.message).toBe("No encontrado");
    expect(error.name).toBe("ApiError");
  });
});

describe("getApiErrorMessage", () => {
  it("devuelve el mensaje de ApiError", () => {
    const error = new ApiError(400, "Error personalizado");

    expect(getApiErrorMessage(error)).toBe("Error personalizado");
  });

  it("devuelve el mensaje genérico", () => {
    expect(getApiErrorMessage(new Error())).toBe(
      "Ocurrio un error inesperado. Intenta de nuevo.",
    );
  });
});

describe("apiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("realiza una petición correctamente", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(JSON.stringify({ success: true })),
      }),
    );

    const response = await apiClient.request<{ success: boolean }>("/test");

    expect(response.success).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("lanza ApiError cuando el backend responde con error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              detail: "No encontrado",
            }),
          ),
      }),
    );

    await expect(apiClient.request("/test")).rejects.toBeInstanceOf(ApiError);
  });

  it("lanza ApiError cuando falla la conexión", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network Error")),
    );

    await expect(apiClient.request("/test")).rejects.toBeInstanceOf(ApiError);
  });

  it("requiere autenticación cuando auth es true y no hay token", async () => {
    vi.doMock("@/stores/app.store", () => ({
      appStore: {
        accessToken: null,
      },
    }));

    await expect(
      apiClient.request("/test", { auth: true }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});