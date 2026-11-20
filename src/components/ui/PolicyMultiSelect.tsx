import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import type { PolicyOption } from "../../api/certificates";
import "./PolicyMultiSelect.css";

interface PolicyMultiSelectProps {
  options: PolicyOption[];
  /** Pólizas seleccionadas; vacío = todas */
  value: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
}

const labelOf = (p: PolicyOption) =>
  p.beneficiary_name ? `${p.beneficiary_name} — ${p.external_code}` : p.external_code;

/** Selector de varias pólizas con búsqueda (vacío equivale a "todas"). */
export default function PolicyMultiSelect({
  options, value, onChange, placeholder = "Todas las pólizas",
}: PolicyMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(() => new Set(value), [value]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((p) => labelOf(p).toLowerCase().includes(q)) : options;
  }, [options, query]);

  const toggle = (id: number) =>
    onChange(selected.has(id) ? value.filter((v) => v !== id) : [...value, id]);

  const summary =
    value.length === 0
      ? placeholder
      : value.length === 1
        ? labelOf(options.find((p) => p.policy_id === value[0]) ?? { policy_id: value[0], external_code: `Póliza ${value[0]}`, beneficiary_name: null })
        : `${value.length} pólizas seleccionadas`;

  return (
    <div className="pms" ref={rootRef}>
      <button
        type="button"
        className={`pms__trigger${value.length > 0 ? " has-value" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="pms__summary">{summary}</span>
        {value.length > 0 && <span className="pms__count">{value.length}</span>}
        <ChevronDown size={16} className="pms__chevron" />
      </button>

      {open && (
        <div className="pms__panel">
          <div className="pms__search">
            <Search size={15} />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cliente o póliza..."
              aria-label="Buscar cliente o póliza"
            />
            {query && (
              <button type="button" className="pms__clear-q" onClick={() => setQuery("")} aria-label="Limpiar búsqueda">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="pms__bulk">
            <button
              type="button"
              onClick={() => onChange([...new Set([...value, ...filtered.map((p) => p.policy_id)])])}
              disabled={filtered.length === 0}
            >
              Seleccionar {query ? "resultados" : "todas"}
            </button>
            <button type="button" onClick={() => onChange([])} disabled={value.length === 0}>
              Limpiar
            </button>
          </div>

          <ul className="pms__list" role="listbox" aria-multiselectable="true">
            {filtered.length === 0 ? (
              <li className="pms__empty">Sin coincidencias</li>
            ) : (
              filtered.map((p) => (
                <li key={p.policy_id}>
                  <label className={`pms__option${selected.has(p.policy_id) ? " is-selected" : ""}`}>
                    <input
                      type="checkbox"
                      checked={selected.has(p.policy_id)}
                      onChange={() => toggle(p.policy_id)}
                    />
                    <span className="pms__name">{p.beneficiary_name ?? "Sin beneficiario"}</span>
                    <span className="pms__code">{p.external_code}</span>
                  </label>
                </li>
              ))
            )}
          </ul>

          <div className="pms__footer">
            {value.length === 0 ? "Sin selección: se usan todas las pólizas" : `${value.length} de ${options.length} seleccionadas`}
          </div>
        </div>
      )}
    </div>
  );
}
