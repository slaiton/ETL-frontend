import { useEffect, useState } from "react";
import { useReports } from "../hooks/useReports";
import {getPolicyOptions, type PolicyOption} from "../../../api/certificates";

const PER_PAGE = 20;

const Reports = () => {
  const { data, loading, total, totalPages, fetchData } = useReports();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [policyId, setPolicyId] = useState("");
  const [page, setPage] = useState(1);
  const [policies, setPolicies] = useState<PolicyOption[]>([]);

  useEffect(() => {
    const loadPolicies = async () => {
      const data = await getPolicyOptions();
      setPolicies(data);
    };

    loadPolicies();
  }, []);

  const handleSearch = async () => {
    setPage(1);

    await fetchData({
      start_date: startDate,
      end_date: endDate,
      policy_id: policyId ? Number(policyId) : undefined,
      page: 1,
      per_page: PER_PAGE,
    });
  };

  const changePage = async (next: number) => {
    setPage(next);

    await fetchData({
      start_date: startDate,
      end_date: endDate,
      policy_id: policyId ? Number(policyId) : undefined,
      page: next,
      per_page: PER_PAGE,
    });
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Reporte de Seguros
      </h1>

      <div className="flex flex-wrap gap-4 items-end mb-6">

        <div>
          <label className="block text-sm font-medium mb-1">
            Fecha Inicial
          </label>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Fecha Final
          </label>

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Póliza
          </label>

          <select
            value={policyId}
            onChange={(e) => setPolicyId(e.target.value)}
            className="border rounded px-3 py-2 min-w-[260px]"
          >
            <option value="">Todas las pólizas</option>

            {policies.map((policy) => (
              <option
                key={policy.policy_id}
                value={policy.policy_id}
              >
                {policy.external_code} - {policy.beneficiary_name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        >
          Consultar
        </button>

      </div>

      {loading && (
        <p>Cargando reporte...</p>
      )}

      {!loading && (
        <>
          <p className="mb-4">
            Total registros: <strong>{total}</strong>
          </p>

          <table className="w-full border border-collapse">

            <thead className="bg-black-200">

              <tr>
                <th className="border p-2">ID</th>
                <th className="border p-2">Certificado</th>
                <th className="border p-2">Asegurado</th>
                <th className="border p-2">Placa</th>
                <th className="border p-2">Valor</th>
              </tr>

            </thead>

            <tbody>

              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border p-3 text-center">
                    No hay información
                  </td>
                </tr>
              ) : (
                data.map((item: any) => (
                  <tr key={item.id}>
                    <td className="border p-2">{item.id}</td>
                    <td className="border p-2">{item.policy_consecutive}</td>
                    <td className="border p-2">{item.insured_name}</td>
                    <td className="border p-2">{item.vehicle_plaque}</td>
                    <td className="border p-2">
                      {item.billing_price?.toLocaleString("es-CO")}
                    </td>
                  </tr>
                ))
              )}

            </tbody>

          </table>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">

              <button
                onClick={() => changePage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>

              <span className="font-medium">
                Página {page} de {totalPages}
              </span>

              <button
                onClick={() => changePage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente →
              </button>

            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;