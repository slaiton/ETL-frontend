import { useEffect, useState } from "react";
import {
  Shield, Plus, Pencil, Trash2, X, Check,
  Home, FileText, DollarSign, Users, LayoutGrid,
} from "lucide-react";
import { getRoles, createRole, updateRole, deleteRole } from "../../../api/roles";
import { ALL_MODULES } from "../../../models/roles.model";
import type { Role, CreateRolePayload, ModuleKey } from "../../../models/roles.model";

/* ── Module icons ────────────────────────────────── */
const MOD_ICON: Record<ModuleKey, React.ReactNode> = {
  dashboard:    <Home size={13} />,
  certificates: <FileText size={13} />,
  invoices:     <DollarSign size={13} />,
  users:        <Users size={13} />,
  roles:        <Shield size={13} />,
};

/* ── Helpers ─────────────────────────────────────── */
const ALL_KEYS = ALL_MODULES.map((m) => m.key);
const isFullAccess = (perms: ModuleKey[]) =>
  ALL_KEYS.every((k) => perms.includes(k));

const BADGE_COLORS = [
  { bg: "rgba(239,68,68,0.1)",   text: "#FCA5A5", border: "rgba(239,68,68,0.25)" },
  { bg: "rgba(59,130,246,0.1)",  text: "#93C5FD", border: "rgba(59,130,246,0.25)" },
  { bg: "rgba(16,185,129,0.1)",  text: "#6EE7B7", border: "rgba(16,185,129,0.25)" },
  { bg: "rgba(167,139,250,0.1)", text: "#C4B5FD", border: "rgba(167,139,250,0.25)" },
];
const roleColor = (idx: number) => BADGE_COLORS[idx % BADGE_COLORS.length];

/* ── Form ────────────────────────────────────────── */
const EMPTY_FORM = { name: "", description: "", permissions: [] as ModuleKey[] };
type FormState = typeof EMPTY_FORM;
type Mode = "create" | "edit" | null;

/* ─────────────────────────────────────────────────
   Modal crear / editar rol
───────────────────────────────────────────────── */
function RoleModal({
  mode, form, saving, error,
  onChange, onToggle, onSelectAll, onSubmit, onClose,
}: {
  mode: "create" | "edit";
  form: FormState;
  saving: boolean;
  error: string;
  onChange: (k: "name" | "description", v: string) => void;
  onToggle: (m: ModuleKey) => void;
  onSelectAll: (all: boolean) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const allChecked = ALL_KEYS.every((k) => form.permissions.includes(k));

  return (
    <div style={mo.overlay} onClick={onClose}>
      <div style={mo.card} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={mo.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Shield size={18} color="#A78BFA" />
            <span style={{ fontWeight: 700, fontSize: 16, color: "#F9FAFB" }}>
              {mode === "create" ? "Nuevo rol" : "Editar rol"}
            </span>
          </div>
          <button onClick={onClose} style={mo.closeBtn}><X size={18} /></button>
        </div>

        {error && <div style={mo.errorBanner}>{error}</div>}

        {/* Campos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
          <div style={mo.fieldGroup}>
            <label style={mo.fieldLabel}>Nombre *</label>
            <input
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              style={mo.fieldInput}
              placeholder="Ej: Supervisor"
            />
          </div>
          <div style={mo.fieldGroup}>
            <label style={mo.fieldLabel}>Descripción</label>
            <input
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              style={mo.fieldInput}
              placeholder="Descripción opcional..."
            />
          </div>
        </div>

        {/* Permisos */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={mo.fieldLabel}>Módulos con acceso</span>
            <button
              onClick={() => onSelectAll(!allChecked)}
              style={mo.btnToggleAll}
            >
              {allChecked ? "Quitar todos" : "Seleccionar todos"}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ALL_MODULES.map((mod) => {
              const active = form.permissions.includes(mod.key);
              return (
                <button
                  key={mod.key}
                  onClick={() => onToggle(mod.key)}
                  style={{ ...mo.permRow, ...(active ? mo.permRowActive : {}) }}
                >
                  {/* Checkbox */}
                  <span style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${active ? "#A78BFA" : "#374151"}`,
                    background: active ? "#7C3AED" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all .15s",
                  }}>
                    {active && <Check size={10} color="#fff" strokeWidth={3} />}
                  </span>

                  {/* Icon */}
                  <span style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: active ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${active ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.07)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: active ? "#C4B5FD" : "#6B7280",
                  }}>
                    {MOD_ICON[mod.key]}
                  </span>

                  <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>
                    {mod.label}
                  </span>

                  {active && (
                    <span style={{
                      marginLeft: "auto", fontSize: 11, color: "#A78BFA",
                      background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)",
                      borderRadius: 999, padding: "1px 8px", fontWeight: 600,
                    }}>
                      Activo
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Resumen */}
          <div style={{ marginTop: 10, fontSize: 12, color: "#6B7280", textAlign: "right" }}>
            {form.permissions.length} de {ALL_MODULES.length} módulos seleccionados
          </div>
        </div>

        {/* Acciones */}
        <div style={mo.actions}>
          <button onClick={onClose} style={mo.btnCancel} disabled={saving}>Cancelar</button>
          <button onClick={onSubmit} style={mo.btnSave} disabled={saving}>
            {saving ? "Guardando..." : (
              <><Check size={14} style={{ marginRight: 6 }} />
              {mode === "create" ? "Crear rol" : "Guardar cambios"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Confirm eliminar
───────────────────────────────────────────────── */
function DeleteConfirm({ role, onConfirm, onCancel, deleting }: {
  role: Role; onConfirm: () => void; onCancel: () => void; deleting: boolean;
}) {
  return (
    <div style={mo.overlay} onClick={onCancel}>
      <div style={{ ...mo.card, maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
        <div style={mo.header}>
          <span style={{ fontWeight: 700, color: "#F87171", fontSize: 15 }}>Eliminar rol</span>
          <button onClick={onCancel} style={mo.closeBtn}><X size={16} /></button>
        </div>
        <p style={{ color: "#9CA3AF", fontSize: 14, padding: "16px 0 8px", lineHeight: 1.5 }}>
          ¿Seguro de eliminar <strong style={{ color: "#E5E7EB" }}>{role.name}</strong>?
          No se puede eliminar si hay usuarios asignados.
        </p>
        <div style={mo.actions}>
          <button onClick={onCancel} style={mo.btnCancel} disabled={deleting}>Cancelar</button>
          <button onClick={onConfirm} style={{ ...mo.btnSave, background: "#DC2626" }} disabled={deleting}>
            <Trash2 size={14} style={{ marginRight: 6 }} />
            {deleting ? "Eliminando..." : "Sí, eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Page
───────────────────────────────────────────────── */
export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>(null);
  const [editTarget, setEditTarget] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState("");
  // Celda de la matriz que está siendo actualizada
  const [matrixSaving, setMatrixSaving] = useState<string | null>(null);
  const [view, setView] = useState<"cards" | "matrix">("cards");

  const fetchRoles = async () => {
    try { setLoading(true); setRoles(await getRoles()); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRoles(); }, []);

  /* Crear */
  const openCreate = () => {
    setForm(EMPTY_FORM); setFormError(""); setEditTarget(null); setMode("create");
  };

  /* Editar */
  const openEdit = (role: Role) => {
    setForm({ name: role.name, description: role.description ?? "", permissions: [...role.permissions] });
    setFormError(""); setEditTarget(role); setMode("edit");
  };

  const handleChange = (k: "name" | "description", v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleToggle = (m: ModuleKey) =>
    setForm((p) => ({
      ...p,
      permissions: p.permissions.includes(m)
        ? p.permissions.filter((x) => x !== m)
        : [...p.permissions, m],
    }));

  const handleSelectAll = (all: boolean) =>
    setForm((p) => ({ ...p, permissions: all ? [...ALL_KEYS] : [] }));

  /* Guardar */
  const handleSubmit = async () => {
    if (!form.name.trim()) { setFormError("El nombre es obligatorio."); return; }
    try {
      setSaving(true); setFormError("");
      if (mode === "create") {
        await createRole({ name: form.name.trim(), description: form.description.trim() || undefined, permissions: form.permissions } as CreateRolePayload);
      } else if (editTarget) {
        await updateRole(editTarget.id, { name: form.name.trim(), description: form.description.trim() || undefined, permissions: form.permissions });
      }
      setMode(null); fetchRoles();
    } catch (err: any) {
      setFormError(err?.response?.data?.detail ?? err?.message ?? "Error al guardar");
    } finally { setSaving(false); }
  };

  /* Eliminar */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteRole(deleteTarget.id);
      setDeleteTarget(null); fetchRoles();
    } catch (err: any) {
      alert(err?.response?.data?.detail ?? "Error al eliminar el rol");
    } finally { setDeleting(false); }
  };

  /* Toggle directo en la matriz */
  const handleMatrixToggle = async (role: Role, module: ModuleKey) => {
    const key = `${role.id}-${module}`;
    if (matrixSaving) return;
    const newPerms = role.permissions.includes(module)
      ? role.permissions.filter((p) => p !== module)
      : [...role.permissions, module];
    try {
      setMatrixSaving(key);
      await updateRole(role.id, { permissions: newPerms });
      fetchRoles();
    } finally { setMatrixSaving(null); }
  };

  return (
    <div style={st.container}>

      {/* ── Header ─────────────────────────────────── */}
      <div style={st.pageHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={st.iconWrap}><Shield size={20} color="#A78BFA" /></div>
          <div>
            <h1 style={st.title}>Roles y permisos</h1>
            <p style={st.subtitle}>Administración de perfiles de acceso</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Toggle vista */}
          <div style={st.viewToggle}>
            <button
              onClick={() => setView("cards")}
              style={{ ...st.viewBtn, ...(view === "cards" ? st.viewBtnActive : {}) }}
              title="Vista tarjetas"
            >
              <Shield size={14} />
            </button>
            <button
              onClick={() => setView("matrix")}
              style={{ ...st.viewBtn, ...(view === "matrix" ? st.viewBtnActive : {}) }}
              title="Matriz de permisos"
            >
              <LayoutGrid size={14} />
            </button>
          </div>
          <button onClick={openCreate} style={st.btnNew}>
            <Plus size={16} style={{ marginRight: 6 }} />Nuevo rol
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "#6B7280", fontSize: 14 }}>Cargando roles...</p>
      ) : view === "cards" ? (

        /* ── Vista tarjetas ──────────────────────── */
        <div style={st.grid}>
          {roles.map((role, idx) => {
            const colors = roleColor(idx);
            const full = isFullAccess(role.permissions);
            return (
              <div key={role.id} style={st.card}>

                <div style={st.cardHeader}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    background: colors.bg, border: `1px solid ${colors.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Shield size={18} color={colors.text} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: "#F9FAFB" }}>{role.name}</span>
                      {full && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#A78BFA",
                          background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)",
                          borderRadius: 999, padding: "2px 7px", letterSpacing: "0.04em" }}>
                          FULL
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>ID: {role.id}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openEdit(role)} style={st.btnEdit} title="Editar">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteTarget(role)} style={st.btnDelete} title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {role.description && (
                  <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0, lineHeight: 1.5 }}>{role.description}</p>
                )}

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280",
                    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                    {role.permissions.length} / {ALL_MODULES.length} módulos
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {role.permissions.length === 0 ? (
                      <span style={{ fontSize: 12, color: "#4B5563", fontStyle: "italic" }}>Sin acceso</span>
                    ) : role.permissions.map((p) => {
                      const mod = ALL_MODULES.find((m) => m.key === p);
                      return (
                        <span key={p} style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
                          borderRadius: 999, padding: "3px 9px", fontSize: 12, fontWeight: 500,
                        }}>
                          {MOD_ICON[p]}
                          {mod?.label ?? p}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      ) : (

        /* ── Vista matriz ────────────────────────── */
        <div style={st.matrixWrap}>
          <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
            Haz clic en una celda para activar o desactivar el permiso directamente.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={st.matrix}>
              <thead>
                <tr>
                  <th style={st.mth}>Rol</th>
                  {ALL_MODULES.map((mod) => (
                    <th key={mod.key} style={st.mth}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <span style={{ color: "#A78BFA" }}>{MOD_ICON[mod.key]}</span>
                        <span>{mod.label}</span>
                      </div>
                    </th>
                  ))}
                  <th style={st.mth}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role, idx) => {
                  const colors = roleColor(idx);
                  const full = isFullAccess(role.permissions);
                  return (
                    <tr key={role.id} style={st.mtr}>
                      {/* Nombre del rol */}
                      <td style={st.mtd}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                            background: colors.bg, border: `1px solid ${colors.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Shield size={13} color={colors.text} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#E5E7EB", display: "flex", alignItems: "center", gap: 5 }}>
                              {role.name}
                              {full && (
                                <span style={{ fontSize: 9, fontWeight: 700, color: "#A78BFA",
                                  background: "rgba(124,58,237,0.12)", borderRadius: 999,
                                  padding: "1px 6px", border: "1px solid rgba(124,58,237,0.2)" }}>
                                  FULL
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: "#4B5563" }}>ID: {role.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Celdas de permisos */}
                      {ALL_MODULES.map((mod) => {
                        const has = role.permissions.includes(mod.key);
                        const cellKey = `${role.id}-${mod.key}`;
                        const busy = matrixSaving === cellKey;
                        return (
                          <td
                            key={mod.key}
                            style={{ ...st.mtd, ...st.mtdCell, cursor: busy ? "wait" : "pointer" }}
                            onClick={() => !busy && handleMatrixToggle(role, mod.key)}
                            title={has ? `Quitar acceso a ${mod.label}` : `Dar acceso a ${mod.label}`}
                          >
                            <div style={{
                              width: 28, height: 28, borderRadius: 8, margin: "0 auto",
                              border: `2px solid ${has ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.07)"}`,
                              background: has ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.02)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all .15s",
                              opacity: busy ? 0.4 : 1,
                            }}>
                              {busy ? (
                                <div style={{ width: 10, height: 10, borderRadius: "50%",
                                  border: "2px solid #A78BFA", borderTopColor: "transparent",
                                  animation: "spin .6s linear infinite" }} />
                              ) : has ? (
                                <Check size={13} color="#A78BFA" strokeWidth={3} />
                              ) : null}
                            </div>
                          </td>
                        );
                      })}

                      {/* Acciones fila */}
                      <td style={st.mtd}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                          <button onClick={() => openEdit(role)} style={st.btnEdit} title="Editar">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setDeleteTarget(role)} style={st.btnDelete} title="Eliminar">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modals ────────────────────────────────── */}
      {mode && (
        <RoleModal
          mode={mode} form={form} saving={saving} error={formError}
          onChange={handleChange} onToggle={handleToggle} onSelectAll={handleSelectAll}
          onSubmit={handleSubmit} onClose={() => setMode(null)}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          role={deleteTarget} deleting={deleting}
          onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ── Page styles ─────────────────────────────────── */
const st: Record<string, React.CSSProperties> = {
  container: { padding: "24px", fontFamily: "Inter, Arial, sans-serif", color: "#e4e4e7", minHeight: "100vh" },
  pageHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 10, flexShrink: 0,
    background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: 800, color: "#F9FAFB", margin: 0 },
  subtitle: { fontSize: 13, color: "#6B7280", margin: "2px 0 0" },
  btnNew: { display: "flex", alignItems: "center",
    background: "rgba(167,139,250,0.15)", color: "#C4B5FD",
    border: "1px solid rgba(167,139,250,0.3)", borderRadius: 10,
    padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: 14 },
  viewToggle: { display: "flex", background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, overflow: "hidden" },
  viewBtn: { background: "transparent", border: "none", color: "#6B7280",
    padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center" },
  viewBtnActive: { background: "rgba(124,58,237,0.2)", color: "#C4B5FD" },

  /* Cards */
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 20 },
  card: { background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", gap: 14,
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)" },
  cardHeader: { display: "flex", alignItems: "center", gap: 12 },
  btnEdit: { background: "rgba(37,99,235,0.12)", color: "#60A5FA", border: "1px solid rgba(37,99,235,0.25)",
    borderRadius: 8, padding: "7px 10px", cursor: "pointer", display: "flex", alignItems: "center" },
  btnDelete: { background: "rgba(220,38,38,0.1)", color: "#F87171", border: "1px solid rgba(220,38,38,0.2)",
    borderRadius: 8, padding: "7px 10px", cursor: "pointer", display: "flex", alignItems: "center" },

  /* Matrix */
  matrixWrap: { background: "rgba(15,23,42,0.7)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16, padding: "20px" },
  matrix: { width: "100%", borderCollapse: "collapse", minWidth: 600 },
  mth: { padding: "12px 16px", textAlign: "center" as const, fontSize: 11, fontWeight: 700,
    color: "#6B7280", textTransform: "uppercase" as const, letterSpacing: "0.05em",
    borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" as const },
  mtd: { padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", verticalAlign: "middle" as const },
  mtdCell: { textAlign: "center" as const, transition: "background .15s" },
  mtr: { transition: "background .1s" },
};

/* ── Modal styles ────────────────────────────────── */
const mo: Record<string, React.CSSProperties> = {
  overlay: { position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  card: { background: "#0F172A", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18, padding: "24px", width: "100%", maxWidth: 480,
    boxShadow: "0 24px 60px rgba(0,0,0,0.7)", maxHeight: "90vh", overflowY: "auto" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  closeBtn: { background: "rgba(255,255,255,0.05)", border: "none", color: "#9CA3AF",
    borderRadius: 8, padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center" },
  errorBanner: { background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)",
    borderRadius: 8, padding: "10px 14px", color: "#FCA5A5", fontSize: 13, marginBottom: 16 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: 600, color: "#6B7280", letterSpacing: "0.04em" },
  fieldInput: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8, padding: "10px 12px", color: "#E5E7EB", fontSize: 13, outline: "none" },
  btnToggleAll: { fontSize: 12, fontWeight: 600, color: "#A78BFA",
    background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)",
    borderRadius: 6, padding: "4px 10px", cursor: "pointer" },
  permRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10, color: "#9CA3AF", fontSize: 13, cursor: "pointer",
    textAlign: "left" as const, width: "100%", transition: "all .15s" },
  permRowActive: { background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", color: "#E5E7EB" },
  actions: { display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 4 },
  btnCancel: { background: "rgba(255,255,255,0.05)", color: "#9CA3AF",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
    padding: "10px 18px", cursor: "pointer", fontWeight: 500, fontSize: 13 },
  btnSave: { background: "#7C3AED", color: "#fff", border: "none", borderRadius: 8,
    padding: "10px 20px", cursor: "pointer", fontWeight: 600, fontSize: 13,
    display: "flex", alignItems: "center" },
};
