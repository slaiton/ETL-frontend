import { useEffect, useState } from "react";
import {
  Shield, Plus, Pencil, Trash2, X, Check,
  Home, FileText, TrendingUp, DollarSign, Users, LayoutGrid, Navigation,
} from "lucide-react";
import { getRoles, createRole, updateRole, deleteRole } from "../../../api/roles";
import { ALL_MODULES, HOME_PAGE_OPTIONS } from "../../../models/roles.model";
import type { Role, CreateRolePayload, ModuleKey } from "../../../models/roles.model";
import { C, ui } from "../../../shared/styles/ui";

/* ── Module icons ────────────────────────────────── */
const MOD_ICON: Record<ModuleKey, React.ReactNode> = {
  dashboard: <Home size={13} />,
  reports: <TrendingUp size={13} />,
  certificates: <FileText size={13} />,
  certificates_basic: <FileText size={13} />,
  invoices: <DollarSign size={13} />,
  users: <Users size={13} />,
  roles: <Shield size={13} />,
  certificates_cancellation: undefined
};

/* ── Helpers ─────────────────────────────────────── */
const ALL_KEYS = ALL_MODULES.map((m) => m.key);
const isFullAccess = (perms: ModuleKey[]) => ALL_KEYS.every((k) => perms.includes(k));

const homePageLabel = (key?: string) =>
  HOME_PAGE_OPTIONS.find(o => o.key === (key ?? "home"))?.label ?? "Inicio";

const BADGE_COLORS = [
  { bg: C.primaryTint, text: C.primaryStrong, border: C.primaryTint2 },
  { bg: C.cyanTint, text: C.cyan, border: C.cyanBorder },
  { bg: C.successTint, text: C.success, border: C.successBorder },
  { bg: C.violetTint, text: C.violet, border: C.violetBorder },
];
const roleColor = (idx: number) => BADGE_COLORS[idx % BADGE_COLORS.length];

/* ── Form ────────────────────────────────────────── */
const EMPTY_FORM = {
  name: "",
  description: "",
  permissions: [] as ModuleKey[],
  home_page: "home",
};
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
  onChange: (k: "name" | "description" | "home_page", v: string) => void;
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
            <Shield size={18} color={C.primaryStrong} />
            <span style={{ fontWeight: 700, fontSize: 16, color: C.ink }}>
              {mode === "create" ? "Nuevo rol" : "Editar rol"}
            </span>
          </div>
          <button onClick={onClose} style={mo.closeBtn}><X size={18} /></button>
        </div>

        {error && <div style={mo.errorBanner}>{error}</div>}

        {/* Campos base */}
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

          {/* Página de inicio */}
          <div style={mo.fieldGroup}>
            <label style={mo.fieldLabel}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Navigation size={12} color={C.muted} />
                Página de inicio del rol
              </span>
            </label>
            <select
              value={form.home_page}
              onChange={(e) => onChange("home_page", e.target.value)}
              style={{ ...mo.fieldInput, cursor: "pointer" }}
            >
              {HOME_PAGE_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span style={{ fontSize: 11, color: C.faint }}>
              Los usuarios con este rol aterrizarán aquí tras iniciar sesión.
            </span>
          </div>
        </div>

        {/* Permisos */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={mo.fieldLabel}>Módulos con acceso</span>
            <button onClick={() => onSelectAll(!allChecked)} style={mo.btnToggleAll}>
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
                  <span style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${active ? C.primary : C.borderStrong}`,
                    background: active ? C.primary : C.surface,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all .15s",
                  }}>
                    {active && <Check size={10} color="#fff" strokeWidth={3} />}
                  </span>
                  <span style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: active ? C.primaryTint : C.surfaceAlt,
                    border: `1px solid ${active ? C.primaryTint2 : C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: active ? C.primaryStrong : C.muted,
                  }}>
                    {MOD_ICON[mod.key]}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>{mod.label}</span>
                  {active && (
                    <span style={{
                      marginLeft: "auto", fontSize: 11, color: C.primaryStrong,
                      background: C.primaryTint, border: `1px solid ${C.primaryTint2}`,
                      borderRadius: 999, padding: "1px 8px", fontWeight: 600,
                    }}>
                      Activo
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 10, fontSize: 12, color: C.muted, textAlign: "right" }}>
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
          <span style={{ fontWeight: 700, color: C.danger, fontSize: 15 }}>Eliminar rol</span>
          <button onClick={onCancel} style={mo.closeBtn}><X size={16} /></button>
        </div>
        <p style={{ color: C.muted, fontSize: 14, padding: "16px 0 8px", lineHeight: 1.5 }}>
          ¿Seguro de eliminar <strong style={{ color: C.ink }}>{role.name}</strong>?
          No se puede eliminar si hay usuarios asignados.
        </p>
        <div style={mo.actions}>
          <button onClick={onCancel} style={mo.btnCancel} disabled={deleting}>Cancelar</button>
          <button onClick={onConfirm} style={{ ...mo.btnSave, background: C.dangerSolid, boxShadow: "0 10px 20px -12px rgba(220,38,38,0.9)" }} disabled={deleting}>
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
  const [matrixSaving, setMatrixSaving] = useState<string | null>(null);
  const [view, setView] = useState<"cards" | "matrix">("cards");

  const fetchRoles = async () => {
    try { setLoading(true); setRoles(await getRoles()); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRoles(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM); setFormError(""); setEditTarget(null); setMode("create");
  };

  const openEdit = (role: Role) => {
    setForm({
      name: role.name,
      description: role.description ?? "",
      permissions: [...role.permissions],
      home_page: role.home_page ?? "home",
    });
    setFormError(""); setEditTarget(role); setMode("edit");
  };

  const handleChange = (k: "name" | "description" | "home_page", v: string) =>
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

  const handleSubmit = async () => {
    if (!form.name.trim()) { setFormError("El nombre es obligatorio."); return; }
    try {
      setSaving(true); setFormError("");
      if (mode === "create") {
        await createRole({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          permissions: form.permissions,
          home_page: form.home_page,
        } as CreateRolePayload);
      } else if (editTarget) {
        await updateRole(editTarget.id, {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          permissions: form.permissions,
          home_page: form.home_page,
        });
      }
      setMode(null); fetchRoles();
    } catch (err: any) {
      setFormError(err?.response?.data?.detail ?? err?.message ?? "Error al guardar");
    } finally { setSaving(false); }
  };

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
    <div className="app-page" style={st.container}>

      {/* ── Header ─────────────────────────────────── */}
      <div style={st.pageHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={st.iconWrap}><Shield size={20} /></div>
          <div>
            <h1 style={st.title}>Roles y permisos</h1>
            <p style={st.subtitle}>Administración de perfiles de acceso</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
        <p style={{ color: C.muted, fontSize: 14 }}>Cargando roles...</p>
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
                      <span style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>{role.name}</span>
                      {full && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: C.primaryStrong,
                          background: C.primaryTint, border: `1px solid ${C.primaryTint2}`,
                          borderRadius: 999, padding: "2px 7px", letterSpacing: "0.04em" }}>
                          FULL
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>ID: {role.id}</div>
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
                  <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.5 }}>
                    {role.description}
                  </p>
                )}

                {/* Home page badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.muted }}>
                  <Navigation size={11} color={C.muted} />
                  <span>Inicio: <span style={{ color: C.muted, fontWeight: 600 }}>{homePageLabel(role.home_page)}</span></span>
                </div>

                <div style={{ borderTop: `1px solid ${C.borderSoft}`, paddingTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted,
                    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                    {role.permissions.length} / {ALL_MODULES.length} módulos
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {role.permissions.length === 0 ? (
                      <span style={{ fontSize: 12, color: C.faint, fontStyle: "italic" }}>Sin acceso</span>
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
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
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
                        <span style={{ color: C.primaryStrong }}>{MOD_ICON[mod.key]}</span>
                        <span>{mod.label}</span>
                      </div>
                    </th>
                  ))}
                  <th style={st.mth}>Inicio</th>
                  <th style={st.mth}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role, idx) => {
                  const colors = roleColor(idx);
                  const full = isFullAccess(role.permissions);
                  return (
                    <tr key={role.id} style={st.mtr}>
                      <td style={st.mtd}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                            background: colors.bg, border: `1px solid ${colors.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Shield size={13} color={colors.text} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, display: "flex", alignItems: "center", gap: 5 }}>
                              {role.name}
                              {full && (
                                <span style={{ fontSize: 9, fontWeight: 700, color: C.primaryStrong,
                                  background: C.primaryTint, borderRadius: 999,
                                  padding: "1px 6px", border: `1px solid ${C.primaryTint2}` }}>
                                  FULL
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: C.faint }}>ID: {role.id}</div>
                          </div>
                        </div>
                      </td>

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
                              border: `2px solid ${has ? C.primary : C.border}`,
                              background: has ? C.primaryTint : C.surface,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all .15s", opacity: busy ? 0.4 : 1,
                            }}>
                              {busy ? (
                                <div style={{ width: 10, height: 10, borderRadius: "50%",
                                  border: `2px solid ${C.primary}`, borderTopColor: "transparent",
                                  animation: "spin .6s linear infinite" }} />
                              ) : has ? (
                                <Check size={13} color={C.primaryStrong} strokeWidth={3} />
                              ) : null}
                            </div>
                          </td>
                        );
                      })}

                      {/* Columna inicio */}
                      <td style={{ ...st.mtd, ...st.mtdCell }}>
                        <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" as const }}>
                          {homePageLabel(role.home_page)}
                        </span>
                      </td>

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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ── Page styles ─────────────────────────────────── */
const st: Record<string, React.CSSProperties> = {
  container: { ...ui.page },
  pageHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  iconWrap: ui.iconTile,
  title: ui.title,
  subtitle: ui.subtitle,
  btnNew: ui.btnPrimary,
  viewToggle: {
    display: "flex", background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 10, overflow: "hidden", padding: 3, gap: 2,
  },
  viewBtn: {
    background: "transparent", border: "none", color: C.muted, borderRadius: 8,
    padding: "7px 11px", cursor: "pointer", display: "flex", alignItems: "center",
  },
  viewBtnActive: { background: C.primaryTint, color: C.primaryStrong },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 20 },
  card: { ...ui.card, padding: "20px", display: "flex", flexDirection: "column", gap: 12 },
  cardHeader: { display: "flex", alignItems: "center", gap: 12 },
  btnEdit: {
    ...ui.btnIcon, background: C.primaryTint, color: C.primaryStrong,
    border: `1px solid ${C.primaryTint2}`,
  },
  btnDelete: {
    ...ui.btnIcon, background: C.dangerTint, color: C.danger,
    border: `1px solid ${C.dangerBorder}`,
  },
  matrixWrap: { ...ui.card, padding: "20px" },
  matrix: { width: "100%", borderCollapse: "collapse", minWidth: 700 },
  mth: { ...ui.th, padding: "12px 16px", textAlign: "center" },
  mtd: { padding: "14px 16px", borderBottom: `1px solid ${C.borderSoft}`, verticalAlign: "middle", color: C.text },
  mtdCell: { textAlign: "center", transition: "background .15s" },
  mtr: { transition: "background .1s" },
};

/* ── Modal styles ────────────────────────────────── */
const mo: Record<string, React.CSSProperties> = {
  overlay: ui.modalOverlay,
  card: { ...ui.modalCard, maxWidth: 480, maxHeight: "90vh", overflowY: "auto" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  closeBtn: {
    ...ui.btnIcon, width: 32, height: 32, minHeight: 32,
    background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.muted,
  },
  errorBanner: {
    background: C.dangerTint, border: `1px solid ${C.dangerBorder}`,
    borderRadius: 10, padding: "10px 14px", color: C.danger, fontSize: 13, marginBottom: 16,
  },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: ui.label,
  fieldInput: ui.input,
  btnToggleAll: {
    fontSize: 12, fontWeight: 600, color: C.primaryStrong,
    background: C.primaryTint, border: `1px solid ${C.primaryTint2}`,
    borderRadius: 8, padding: "5px 10px", cursor: "pointer",
  },
  permRow: {
    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 12, color: C.text, fontSize: 13, cursor: "pointer",
    textAlign: "left", width: "100%", transition: "all .15s",
  },
  permRowActive: { background: C.primaryTint, border: `1px solid ${C.primaryTint2}`, color: C.ink },
  actions: { display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 4 },
  btnCancel: ui.btnSecondary,
  btnSave: ui.btnPrimary,
};
