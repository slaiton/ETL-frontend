import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axiosClient } from "../shared/api/axiosClient";
import { downloadReportExcel, getReports } from "./reports";

vi.mock("../shared/api/axiosClient", () => ({
  axiosClient: { get: vi.fn() },
}));

describe("certificate report filters", () => {
  beforeEach(() => {
    vi.mocked(axiosClient.get).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([true, false])(
    "sends cancellation filtering to the JSON report as a boolean (%s)",
    async (is_cancelled) => {
      vi.mocked(axiosClient.get).mockResolvedValueOnce({
        data: { data: [] },
      } as never);

      await getReports({
        start_date: "2026-01-01",
        policy_id: 9,
        is_cancelled,
        page: 2,
      });

      expect(axiosClient.get).toHaveBeenCalledWith("/certificates/report", {
        params: {
          start_date: "2026-01-01",
          policy_id: 9,
          is_cancelled,
          page: 2,
        },
      });
    },
  );

  it("uses the same selected filters for the Excel report", async () => {
    vi.mocked(axiosClient.get).mockResolvedValueOnce({
      data: { file_base64: "data", filename: "report.xlsx" },
    } as never);

    await downloadReportExcel({
      start_date: "2026-01-01",
      end_date: "2026-01-31",
      policy_id: 9,
      is_cancelled: false,
    });

    expect(axiosClient.get).toHaveBeenCalledWith(
      "/certificates/report/excel",
      {
        params: {
          start_date: "2026-01-01",
          end_date: "2026-01-31",
          policy_id: 9,
          is_cancelled: false,
        },
      },
    );
  });

  it("omits the cancellation filter when it is not selected", async () => {
    vi.mocked(axiosClient.get).mockResolvedValueOnce({
      data: { data: [] },
    } as never);

    await getReports({
      start_date: "2026-01-01",
      is_cancelled: undefined,
    });

    expect(axiosClient.get).toHaveBeenCalledWith("/certificates/report", {
      params: { start_date: "2026-01-01" },
    });
  });
});
