import { useEffect, useState } from "react";
import { Users as UsersIcon, Plus, Pencil, Trash2, X, Check, Building2 } from "lucide-react";
import { useUsers } from "../hooks/useUsers";
import { createUser, updateUser, deleteUser, getClients } from "../../../api/users";
import { getRoles } from "../../../api/roles";
import type { User, CreateUserPayload, UpdateUserPayload, ClientOption } from "../../../models/users.model";
import type { Role } from "../../../models/roles.model";
import { C, ui, pill } from "../../../shared/styles/ui";

/* ── Form state ──────────────────────────────────── */
const emptyForm = {
  first_name: "", last_name: "", phone: "", email: "", password: "", role_id: 1,
  /** "" = sin cliente (usuario interno) */
  client_id: "",
};

type FormState = typeof emptyForm;
type Mode = "create" | "edit" | null;

/* ── Avatar initials ─────────────────────────────── */
function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return (
    <div style={{
      width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
      background: C.gradient,
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
  roles: Role[];
  clients: ClientOption[];
  /** Nombre del cliente actual, por si ya no aparece en el listado */
  currentClientName?: string | null;
  onChange: (k: keyof FormState, v: string | number) => void;
  onSubmit: () => void;
  onClose: () => void;
}

function UserModal({
  mode, form, saving, error, roles, clients, currentClientName, onChange, onSubmit, onClose,
}: ModalProps) {
  const missingCurrent =
    !!form.client_id && !clients.some((c) => String(c.client_id) === form.client_id);
  return (
    <div style={mo.overlay} onClick={onClose}>
      <div style={mo.card} onClick={(e) => e.stopPropagation()}>

        <div style={mo.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <UsersIcon size={18} color={C.primaryStrong} />
            <span style={{ fontWeight: 700, fontSize: 16, color: C.ink }}>
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
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div style={{ ...mo.fieldGroup, gridColumn: "1 / -1" }}>
            <label style={mo.fieldLabel}>Cliente</label>
            <select
              value={form.client_id}
              onChange={(e) => onChange("client_id", e.target.value)}
              style={mo.fieldInput}
            >
              <option value="">Sin cliente (usuario interno)</option>
              {missingCurrent && (
                <option value={form.client_id}>{currentClientName ?? `Cliente ${form.client_id}`}</option>
              )}
              {clients.map((c) => (
                <option key={c.client_id} value={String(c.client_id)}>
                  {c.name}{c.document_number ? ` — NIT ${c.document_number}` : ""}
                </option>
              ))}
            </select>
            <span style={mo.fieldHint}>
              Clientes con pólizas de facturación. El cliente se muestra en el perfil del usuario.
            </span>
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
          <span style={{ fontWeight: 700, color: C.danger, fontSize: 15 }}>Eliminar usuario</span>
          <button onClick={onCancel} style={mo.closeBtn}><X size={16} /></button>
        </div>
        <p style={{ color: C.muted, fontSize: 14, padding: "8px 0 20px", lineHeight: 1.5 }}>
          ¿Estás seguro de eliminar a <strong style={{ color: C.ink }}>{user.first_name} {user.last_name}</strong>?
          Esta acción no se puede deshacer.
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

/* ── Page ────────────────────────────────────────── */
export default function UsersPage() {
  const { users, loading, fetchUsers } = useUsers();
  const [roles, setRoles] = useState<Role[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [mode, setMode] = useState<Mode>(null);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
    getRoles().then(setRoles).catch(() => {});
    getClients().then(setClients);
  }, [fetchUsers]);

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
      client_id: user.client_id ? String(user.client_id) : "",
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
        const created = await createUser(payload);
        // /register es público y no recibe cliente: se asigna con el PATCH protegido
        if (form.client_id && created?.id) {
          await updateUser(created.id, { client_id: Number(form.client_id) });
        }
      } else if (editTarget) {
        const payload: UpdateUserPayload = {
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          email: form.email,
          role_id: form.role_id,
        };
        // Solo se envía si cambió (null = quitar cliente)
        const originalClient = editTarget.client_id ? String(editTarget.client_id) : "";
        if (form.client_id !== originalClient) {
          payload.client_id = form.client_id ? Number(form.client_id) : null;
        }
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
    <div className="app-page" style={st.container}>

      {/* ── Header ───────────────────────────────────── */}
      <div style={st.pageHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={st.iconWrap}><UsersIcon size={20} /></div>
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
              <th style={st.th}>Cliente</th>
              <th style={{ ...st.th, textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={st.noData}>Cargando usuarios...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={st.noData}>
                {search ? `Sin resultados para "${search}"` : "No hay usuarios registrados"}
              </td></tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} style={st.tr}>
                  <td style={st.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Initials name={`${user.first_name} ${user.last_name}`} />
                      <div>
                        <div style={{ fontWeight: 600, color: C.ink, fontSize: 14 }}>
                          {user.first_name} {user.last_name}
                        </div>
                        <div style={{ fontSize: 11, color: C.faint }}>ID #{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={st.td}>{user.email}</td>
                  <td style={st.td}>{user.phone || "—"}</td>
                  <td style={st.td}>
                    <span style={st.roleBadge}>
                      {roles.find((r) => r.id === user.role_id)?.name ?? `Rol ${user.role_id}`}
                    </span>
                  </td>
                  <td style={st.td}>
                    {user.client_name ? (
                      <span style={st.clientCell}>
                        <Building2 size={14} color={C.primaryStrong} style={{ flexShrink: 0 }} />
                        {user.client_name}
                      </span>
                    ) : (
                      <span style={pill("neutral")}>Interno</span>
                    )}
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
          roles={roles}
          clients={clients}
          currentClientName={editTarget?.client_name}
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
  container: { ...ui.page },
  pageHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 20, flexWrap: "wrap", gap: 12,
  },
  iconWrap: ui.iconTile,
  title: ui.title,
  subtitle: ui.subtitle,
  btnNew: ui.btnPrimary,
  searchBar: {
    display: "flex", alignItems: "center",
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 12, padding: "0 12px", marginBottom: 16,
    maxWidth: 400,
  },
  searchInput: {
    background: "transparent", border: "none", color: C.ink,
    padding: "11px 8px", outline: "none", fontSize: 14, flex: 1,
    boxShadow: "none",
  },
  searchClear: {
    background: "none", border: "none", color: C.muted,
    cursor: "pointer", fontSize: 13, padding: "4px 0",
  },
  tableWrapper: ui.tableWrap,
  table: { ...ui.table, minWidth: 780 },
  thead: {},
  th: ui.th,
  tr: {},
  td: ui.td,
  noData: ui.noData,
  roleBadge: pill("primary"),
  clientCell: {
    display: "inline-flex", alignItems: "center", gap: 6,
    color: C.ink, fontWeight: 500,
  },
  btnEdit: { ...ui.btnIcon, ...pill("primary"), padding: 0, width: 34, height: 34, borderRadius: 9, justifyContent: "center", cursor: "pointer" },
  btnDelete: { ...ui.btnIcon, ...pill("danger"), padding: 0, width: 34, height: 34, borderRadius: 9, justifyContent: "center", cursor: "pointer" },
};

/* ── Modal styles ────────────────────────────────── */
const mo: Record<string, React.CSSProperties> = {
  overlay: ui.modalOverlay,
  card: { ...ui.modalCard, maxWidth: 560 },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 20,
  },
  closeBtn: {
    ...ui.btnIcon, width: 32, height: 32, minHeight: 32,
    background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.muted,
  },
  errorBanner: {
    background: C.dangerTint, border: `1px solid ${C.dangerBorder}`,
    borderRadius: 10, padding: "10px 14px", color: C.danger,
    fontSize: 13, marginBottom: 16,
  },
  grid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px",
    marginBottom: 24,
  },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: ui.label,
  fieldHint: { fontSize: 11, color: C.faint },
  fieldInput: ui.input,
  actions: { display: "flex", justifyContent: "flex-end", gap: 10 },
  btnCancel: ui.btnSecondary,
  btnSave: ui.btnPrimary,
};
