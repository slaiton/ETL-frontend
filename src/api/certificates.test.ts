import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axiosClient } from "../shared/api/axiosClient";
import { getAllCertificates, getCertificates } from "./certificates";

vi.mock("../shared/api/axiosClient", () => ({
  axiosClient: { get: vi.fn() },
}));

describe("getAllCertificates", () => {
  beforeEach(() => {
    vi.mocked(axiosClient.get).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns all records when the result fits on one page", async () => {
    const records = [{ id: 1 }];
    vi.mocked(axiosClient.get).mockResolvedValueOnce({
      data: { data: records, total_pages: 1 },
    } as never);

    await expect(getAllCertificates({ waybill: "WB-1" })).resolves.toEqual(
      records,
    );
    expect(axiosClient.get).toHaveBeenCalledWith("/certificates/get_all", {
      params: { waybill: "WB-1", page: 1, per_page: 20 },
    });
  });

  it("fetches each page using the applied filters", async () => {
    vi.mocked(axiosClient.get)
      .mockResolvedValueOnce({
        data: { data: [{ id: 1 }], total_pages: 3 },
      } as never)
      .mockResolvedValueOnce({ data: { data: [{ id: 2 }] } } as never)
      .mockResolvedValueOnce({ data: { data: [{ id: 3 }] } } as never);

    await expect(
      getAllCertificates({ policy_id: 12, page: 4, per_page: 10 }),
    ).resolves.toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);

    expect(axiosClient.get).toHaveBeenNthCalledWith(2, "/certificates/get_all", {
      params: { policy_id: 12, page: 2, per_page: 10 },
    });
    expect(axiosClient.get).toHaveBeenNthCalledWith(3, "/certificates/get_all", {
      params: { policy_id: 12, page: 3, per_page: 10 },
    });
  });

  it("fails rather than exporting an incomplete result if a page fails", async () => {
    const logError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(axiosClient.get)
      .mockResolvedValueOnce({
        data: { data: [{ id: 1 }], total_pages: 2 },
      } as never)
      .mockRejectedValueOnce(new Error("network error"));

    await expect(getAllCertificates()).rejects.toThrow(
      "No fue posible consultar la página 2 de certificados.",
    );
    expect(logError).toHaveBeenCalled();
  });

  it("rejects responses without usable pagination metadata", async () => {
    vi.mocked(axiosClient.get).mockResolvedValueOnce({
      data: { data: [{ id: 1 }] },
    } as never);

    await expect(getAllCertificates()).rejects.toThrow(
      "La respuesta no contiene información de paginación válida.",
    );
  });

  it.each([true, false])(
    "sends the cancellation filter as a boolean (%s)",
    async (is_cancelled) => {
      vi.mocked(axiosClient.get).mockResolvedValueOnce({
        data: { data: [], total_pages: 1 },
      } as never);

      await getCertificates({
        waybill: "WB-1",
        is_cancelled,
      });

      expect(axiosClient.get).toHaveBeenCalledWith("/certificates/get_all", {
        params: { waybill: "WB-1", is_cancelled },
      });
    },
  );

  it("preserves the cancellation and existing filters across exported pages", async () => {
    vi.mocked(axiosClient.get)
      .mockResolvedValueOnce({
        data: { data: [{ id: 1 }], total_pages: 2 },
      } as never)
      .mockResolvedValueOnce({ data: { data: [{ id: 2 }] } } as never);

    await expect(
      getAllCertificates({
        policy_id: 12,
        is_cancelled: false,
        per_page: 10,
      }),
    ).resolves.toEqual([{ id: 1 }, { id: 2 }]);

    expect(axiosClient.get).toHaveBeenNthCalledWith(1, "/certificates/get_all", {
      params: { policy_id: 12, is_cancelled: false, per_page: 10, page: 1 },
    });
    expect(axiosClient.get).toHaveBeenNthCalledWith(2, "/certificates/get_all", {
      params: { policy_id: 12, is_cancelled: false, per_page: 10, page: 2 },
    });
  });
});
