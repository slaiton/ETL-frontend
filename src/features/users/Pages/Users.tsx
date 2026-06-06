import { useEffect, useState } from "react";
import { Users as UsersIcon, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { useUsers } from "../hooks/useUsers";
import { createUser, updateUser, deleteUser } from "../../../api/users";
import type { User, CreateUserPayload, UpdateUserPayload } from "../../../models/users.model";
import { STATIC_ROLES } from "../../../models/users.model";

/* ── Form state ──────────────────────────────────── */
const emptyForm = {
  first_name: "", last_name: "", phone: "", email: "", password: "", role_id: 1,
};

type FormState = typeof emptyForm;
type Mode = "create" | "edit" | null;

/* ── Role label helper ───────────────────────────── */
function roleName(roleId: number) {
  return STATIC_ROLES.find((r) => r.id === roleId)?.name ?? `Rol ${roleId}`;
}

/* ── Avatar initials ─────────────────────────────── */
function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return (
    <div style={{
      width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg,#3B82F6,#8B5CF6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, fontWeight: 700, color: "#fff", textTransform: "uppercase",
    }}>
      {letters.toUpperCase()}
    </div>
  );
}

/* ── Modal ───────────────────────────────────────── */
interface ModalProps {
  mode: "create" | "edit";
  form: FormState;
  saving: boolean;
  error: string;
  onChange: (k: keyof FormState, v: string | number) => void;
  onSubmit: () => void;
  onClose: () => void;
}

function UserModal({ mode, form, saving, error, onChange, onSubmit, onClose }: ModalProps) {
  return (
    <div style={mo.overlay} onClick={onClose}>
      <div style={mo.card} onClick={(e) => e.stopPropagation()}>

        <div style={mo.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <UsersIcon size={18} color="#60A5FA" />
            <span style={{ fontWeight: 700, fontSize: 16, color: "#F9FAFB" }}>
              {mode === "create" ? "Nuevo usuario" : "Editar usuario"}
            </span>
          </div>
          <button onClick={onClose} style={mo.closeBtn}><X size={18} /></button>
        </div>

        {error && <div style={mo.errorBanner}>{error}</div>}

        <div style={mo.grid}>
          <Field label="Nombre" value={form.first_name} onChange={(v) => onChange("first_name", v)} />
          <Field label="Apellido" value={form.last_name} onChange={(v) => onChange("last_name", v)} />
          <Field label="Email" type="email" value={form.email} onChange={(v) => onChange("email", v)} />
          <Field label="Teléfono" value={form.phone} onChange={(v) => onChange("phone", v)} />
          {mode === "create" && (
            <Field label="Contraseña" type="password" value={form.password} onChange={(v) => onChange("password", v)} />
          )}
          <div style={mo.fieldGroup}>
            <label style={mo.fieldLabel}>Rol</label>
            <select
              value={form.role_id}
              onChange={(e) => onChange("role_id", Number(e.target.value))}
              style={mo.fieldInput}
            >
              {STATIC_ROLES.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={mo.actions}>
          <button onClick={onClose} style={mo.btnCancel} disabled={saving}>Cancelar</button>
          <button onClick={onSubmit} style={mo.btnSave} disabled={saving}>
            {saving ? "Guardando..." : <><Check size={14} style={{ marginRight: 6 }} />{mode === "create" ? "Crear usuario" : "Guardar cambios"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div style={mo.fieldGroup}>
      <label style={mo.fieldLabel}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={mo.fieldInput}
        autoComplete={type === "password" ? "new-password" : undefined}
      />
    </div>
  );
}

/* ── Delete confirm ──────────────────────────────── */
interface DeleteConfirmProps {
  user: User;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}
function DeleteConfirm({ user, onConfirm, onCancel, deleting }: DeleteConfirmProps) {
  return (
    <div style={mo.overlay} onClick={onCancel}>
      <div style={{ ...mo.card, maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
        <div style={mo.header}>
          <span style={{ fontWeight: 700, color: "#F87171", fontSize: 15 }}>Eliminar usuario</span>
          <button onClick={onCancel} style={mo.closeBtn}><X size={16} /></button>
        </div>
        <p style={{ color: "#9CA3AF", fontSize: 14, padding: "16px 0 8px" }}>
          ¿Estás seguro de eliminar a <strong style={{ color: "#E5E7EB" }}>{user.first_name} {user.last_name}</strong>?
          Esta acción no se puede deshacer.
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

/* ── Page ────────────────────────────────────────── */
export default function UsersPage() {
  const { users, loading, fetchUsers } = useUsers();
  const [mode, setMode] = useState<Mode>(null);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openCreate = () => {
    setForm(emptyForm);
    setFormError("");
    setEditTarget(null);
    setMode("create");
  };

  const openEdit = (user: User) => {
    setForm({
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      email: user.email,
      password: "",
      role_id: user.role_id,
    });
    setFormError("");
    setEditTarget(user);
    setMode("edit");
  };

  const closeModal = () => { setMode(null); setEditTarget(null); };

  const handleChange = (k: keyof FormState, v: string | number) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name || !form.email) {
      setFormError("Nombre, apellido y email son obligatorios.");
      return;
    }
    if (mode === "create" && !form.password) {
      setFormError("La contraseña es obligatoria.");
      return;
    }
    try {
      setSaving(true);
      setFormError("");
      if (mode === "create") {
        const payload: CreateUserPayload = {
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          email: form.email,
          password: form.password,
          role_id: form.role_id,
        };
        await createUser(payload);
      } else if (editTarget) {
        const payload: UpdateUserPayload = {
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          email: form.email,
          role_id: form.role_id,
        };
        await updateUser(editTarget.id, payload);
      }
      closeModal();
      fetchUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.message ?? "Error al guardar";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err: any) {
      alert(err?.response?.data?.detail ?? "Error al eliminar el usuario");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = search
    ? users.filter((u) =>
        `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  return (
    <div style={st.container}>

      {/* ── Header ───────────────────────────────────── */}
      <div style={st.pageHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={st.iconWrap}><UsersIcon size={20} color="#60A5FA" /></div>
          <div>
            <h1 style={st.title}>Usuarios</h1>
            <p style={st.subtitle}>{users.length} usuario{users.length !== 1 ? "s" : ""} registrado{users.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button onClick={openCreate} style={st.btnNew}>
          <Plus size={16} style={{ marginRight: 6 }} />
          Nuevo usuario
        </button>
      </div>

      {/* ── Search bar ───────────────────────────────── */}
      <div style={st.searchBar}>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={st.searchInput}
        />
        {search && (
          <button onClick={() => setSearch("")} style={st.searchClear}>✕</button>
        )}
      </div>

      {/* ── Table ────────────────────────────────────── */}
      <div style={st.tableWrapper}>
        <table style={st.table}>
          <thead>
            <tr style={st.thead}>
              <th style={st.th}>Usuario</th>
              <th style={st.th}>Email</th>
              <th style={st.th}>Teléfono</th>
              <th style={st.th}>Rol</th>
              <th style={{ ...st.th, textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={st.noData}>Cargando usuarios...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={st.noData}>
                {search ? `Sin resultados para "${search}"` : "No hay usuarios registrados"}
              </td></tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} style={st.tr}>
                  <td style={st.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Initials name={`${user.first_name} ${user.last_name}`} />
                      <div>
                        <div style={{ fontWeight: 600, color: "#E5E7EB", fontSize: 14 }}>
                          {user.first_name} {user.last_name}
                        </div>
                        <div style={{ fontSize: 11, color: "#6B7280" }}>ID #{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={st.td}>{user.email}</td>
                  <td style={st.td}>{user.phone || "—"}</td>
                  <td style={st.td}>
                    <span style={st.roleBadge}>{roleName(user.role_id)}</span>
                  </td>
                  <td style={{ ...st.td, textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      <button
                        onClick={() => openEdit(user)}
                        style={st.btnEdit}
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(user)}
                        style={st.btnDelete}
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modals ───────────────────────────────────── */}
      {mode && (
        <UserModal
          mode={mode}
          form={form}
          saving={saving}
          error={formError}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          user={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}

/* ── Page styles ─────────────────────────────────── */
const st: Record<string, React.CSSProperties> = {
  container: {
    padding: "24px", fontFamily: "Inter, Arial, sans-serif",
    color: "#e4e4e7", minHeight: "100vh",
  },
  pageHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 20, flexWrap: "wrap", gap: 12,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
    background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 22, fontWeight: 800, color: "#F9FAFB", margin: 0 },
  subtitle: { fontSize: 13, color: "#6B7280", margin: "2px 0 0" },
  btnNew: {
    display: "flex", alignItems: "center",
    background: "#2563EB", color: "#fff", border: "none",
    borderRadius: 10, padding: "10px 18px", cursor: "pointer",
    fontWeight: 600, fontSize: 14, boxShadow: "0 4px 14px rgba(37,99,235,.35)",
    transition: "all .2s",
  },
  searchBar: {
    display: "flex", alignItems: "center",
    background: "rgba(30,30,36,0.95)", border: "1px solid #2d2d35",
    borderRadius: 10, padding: "0 12px", marginBottom: 16,
    maxWidth: 400,
  },
  searchInput: {
    background: "transparent", border: "none", color: "#E5E7EB",
    padding: "11px 8px", outline: "none", fontSize: 14, flex: 1,
  },
  searchClear: {
    background: "none", border: "none", color: "#6B7280",
    cursor: "pointer", fontSize: 13, padding: "4px 0",
  },
  tableWrapper: {
    overflowX: "auto", borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(15,23,42,0.7)",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 650 },
  thead: { background: "rgba(15,23,42,0.9)" },
  th: {
    padding: "13px 16px", textAlign: "left",
    fontSize: 11, fontWeight: 700, color: "#6B7280",
    textTransform: "uppercase", letterSpacing: "0.06em",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    transition: "background .15s",
  },
  td: {
    padding: "14px 16px", fontSize: 13, color: "#D1D5DB", verticalAlign: "middle",
  },
  noData: {
    textAlign: "center", padding: "40px", color: "#6B7280", fontSize: 14,
  },
  roleBadge: {
    display: "inline-block",
    background: "rgba(99,102,241,0.12)", color: "#A5B4FC",
    border: "1px solid rgba(99,102,241,0.25)",
    borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 600,
  },
  btnEdit: {
    background: "rgba(37,99,235,0.12)", color: "#60A5FA",
    border: "1px solid rgba(37,99,235,0.25)", borderRadius: 8,
    padding: "7px 10px", cursor: "pointer", display: "flex",
    alignItems: "center", transition: "all .2s",
  },
  btnDelete: {
    background: "rgba(220,38,38,0.1)", color: "#F87171",
    border: "1px solid rgba(220,38,38,0.2)", borderRadius: 8,
    padding: "7px 10px", cursor: "pointer", display: "flex",
    alignItems: "center", transition: "all .2s",
  },
};

/* ── Modal styles ────────────────────────────────── */
const mo: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 200,
    background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 16,
  },
  card: {
    background: "#0F172A", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18, padding: "24px", width: "100%", maxWidth: 560,
    boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 20,
  },
  closeBtn: {
    background: "rgba(255,255,255,0.05)", border: "none", color: "#9CA3AF",
    borderRadius: 8, padding: "6px 8px", cursor: "pointer",
    display: "flex", alignItems: "center",
  },
  errorBanner: {
    background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)",
    borderRadius: 8, padding: "10px 14px", color: "#FCA5A5",
    fontSize: 13, marginBottom: 16,
  },
  grid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px",
    marginBottom: 24,
  },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: 600, color: "#6B7280", letterSpacing: "0.04em" },
  fieldInput: {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8, padding: "10px 12px", color: "#E5E7EB",
    fontSize: 13, outline: "none", colorScheme: "dark",
    appearance: "none",
  },
  actions: { display: "flex", justifyContent: "flex-end", gap: 10 },
  btnCancel: {
    background: "rgba(255,255,255,0.05)", color: "#9CA3AF",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
    padding: "10px 18px", cursor: "pointer", fontWeight: 500, fontSize: 13,
  },
  btnSave: {
    background: "#2563EB", color: "#fff", border: "none", borderRadius: 8,
    padding: "10px 20px", cursor: "pointer", fontWeight: 600, fontSize: 13,
    display: "flex", alignItems: "center",
  },
};
