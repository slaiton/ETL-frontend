import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Certificate } from "../../../models/certificates.model";
import {
  getAllCertificates,
  getPolicyOptions,
} from "../../../api/certificates";
import { useCertificates } from "../hooks/useCertificates";
import CertificatesBasic from "./CertificatesBasic";

vi.mock("../hooks/useCertificates", () => ({
  useCertificates: vi.fn(),
}));

vi.mock("../../../shared/context/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("../../../api/certificates", () => ({
  getAllCertificates: vi.fn(),
  getPolicyOptions: vi.fn(),
}));

const records: Certificate[] = [
  {
    id: 101,
    consecutive: "CERT-101",
    factus_bill_consecutive: "",
    waybill: "WB-101",
    plaque: null,
    policy_id: 1,
    start_at: "2026-01-01T00:00:00",
    end_at: "2026-01-02T00:00:00",
    customer_id: 1,
    bill_url: null,
    billing_price: "10.00",
    created_at: "2026-01-01T00:00:00",
    deleted_at: "2026-01-03T00:00:00",
    is_cancelled: true,
  },
  {
    id: 102,
    consecutive: "CERT-102",
    factus_bill_consecutive: "",
    waybill: "WB-102",
    plaque: null,
    policy_id: 1,
    start_at: "2026-01-01T00:00:00",
    end_at: "2026-01-02T00:00:00",
    customer_id: 1,
    bill_url: null,
    billing_price: "10.00",
    created_at: "2026-01-01T00:00:00",
    deleted_at: null,
    is_cancelled: false,
  },
];

const fetchData = vi.fn();
const originalCreateObjectURL = Object.getOwnPropertyDescriptor(
  URL,
  "createObjectURL",
);
const originalRevokeObjectURL = Object.getOwnPropertyDescriptor(
  URL,
  "revokeObjectURL",
);

function getFilterSelect(label: string): HTMLSelectElement {
  const fieldLabel = screen.getByText(label);
  const select = fieldLabel.parentElement?.querySelector("select");
  if (!select) throw new Error(`No se encontró el filtro "${label}".`);
  return select;
}

async function renderPage() {
  await act(async () => {
    render(<CertificatesBasic />);
  });
}

describe("Certificados cliente: anulación", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCertificates).mockReturnValue({
      data: records,
      total: records.length,
      totalPages: 1,
      loading: false,
      fetchData,
    });
    vi.mocked(getPolicyOptions).mockResolvedValue([]);
    vi.mocked(getAllCertificates).mockResolvedValue(records);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    if (originalCreateObjectURL) {
      Object.defineProperty(URL, "createObjectURL", originalCreateObjectURL);
    } else {
      Reflect.deleteProperty(URL, "createObjectURL");
    }
    if (originalRevokeObjectURL) {
      Object.defineProperty(URL, "revokeObjectURL", originalRevokeObjectURL);
    } else {
      Reflect.deleteProperty(URL, "revokeObjectURL");
    }
  });

  it.each([
    ["true", true],
    ["false", false],
  ])("envía is_cancelled=%s y conserva los demás filtros", async (value, expected) => {
    await renderPage();

    fireEvent.change(screen.getByPlaceholderText("Ej: 12345"), {
      target: { value: "42" },
    });
    fireEvent.change(getFilterSelect("Facturación"), {
      target: { value: "true" },
    });
    fireEvent.change(getFilterSelect("Anulación"), {
      target: { value },
    });
    fireEvent.click(screen.getByRole("button", { name: /Buscar/ }));

    expect(fetchData).toHaveBeenLastCalledWith({
      page: 1,
      per_page: 20,
      id: 42,
      is_invoiced: true,
      is_cancelled: expected,
    });
  });

  it("omite is_cancelled cuando se selecciona Todos", async () => {
    await renderPage();

    fireEvent.click(screen.getByRole("button", { name: /Buscar/ }));

    expect(fetchData).toHaveBeenLastCalledWith({ page: 1, per_page: 20 });
  });

  it("muestra Sí/No en la columna de anulación", async () => {
    await renderPage();

    expect(
      screen.getByRole("columnheader", { name: "Anulado" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sí")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("bloquea la descarga de anulados y la mantiene para vigentes", async () => {
    await renderPage();

    const cancelledRow = screen.getByText("CERT-101").closest("tr");
    const activeRow = screen.getByText("CERT-102").closest("tr");

    expect(cancelledRow).not.toBeNull();
    expect(activeRow).not.toBeNull();
    expect(
      within(cancelledRow as HTMLTableRowElement).getByRole("button", {
        name: "Descargar",
      }),
    ).toBeDisabled();
    expect(
      within(activeRow as HTMLTableRowElement).getByRole("button", {
        name: "Descargar",
      }),
    ).toBeEnabled();
  });

  it("exporta la columna Anulado y sus valores Sí/No", async () => {
    let csvContent = "";
    vi.stubGlobal(
      "Blob",
      class {
        constructor(parts: BlobPart[]) {
          csvContent = parts.map(String).join("");
        }
      },
    );
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:certificates"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    await renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Excel" }));

    await waitFor(() => expect(getAllCertificates).toHaveBeenCalled());
    await waitFor(() => expect(csvContent).toContain("Anulado"));
    expect(csvContent).toContain('"Sí"');
    expect(csvContent).toContain('"No"');
  });
});
