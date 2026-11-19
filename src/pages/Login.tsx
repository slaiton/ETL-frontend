import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle, ArrowRight, BarChart3, Eye, EyeOff, FileText, Lock, Mail, Receipt,
} from "lucide-react";
import { useAuth } from "../shared/context/AuthContext";
import BrandLogo from "../shared/brand/BrandLogo";
import "./Login.css";

interface LoginForm {
  user: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, homePage } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(homePage, { replace: true });
    }
  }, [isAuthenticated, navigate, homePage]);

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError(null);

    try {
      await login(data.user.trim(), data.password);
      // login() guarda home_page en localStorage antes de actualizar el estado
      const homePath = localStorage.getItem("home_page") ?? "/home";
      navigate(homePath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      {/* ── Panel de marca (escritorio) ─────────────────── */}
      <aside className="login__brand">
        <BrandLogo tone="onDark" monochrome height={52} />

        <div className="login__headline">
          <h1>Los indicadores de tu operación, en un solo lugar</h1>
          <p>
            Consulta certificados, facturación y terceros con datos actualizados
            desde el data warehouse.
          </p>
          <ul className="login__features">
            <li><span><BarChart3 size={17} /></span>Dashboard en tiempo real</li>
            <li><span><FileText size={17} /></span>Consulta y reportes de certificados</li>
            <li><span><Receipt size={17} /></span>Seguimiento de facturas</li>
          </ul>
        </div>

        <p className="login__brand-footer">
          © {new Date().getFullYear()} Tecnología Funcional
        </p>

        <div className="login__bars" aria-hidden="true">
          <span style={{ height: 90 }} />
          <span style={{ height: 140 }} />
          <span style={{ height: 200 }} />
        </div>
      </aside>

      {/* ── Formulario ─────────────────────────────────── */}
      <main className="login__panel">
        <div className="login__card">
          <div className="login__mobile-logo">
            <BrandLogo tone="onLight" height={44} />
          </div>

          <h2 className="login__title">Iniciar sesión</h2>
          <p className="login__subtitle">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit(onSubmit)} className="login__form" noValidate>
            <div className={`field${errors.user ? " field--error" : ""}`}>
              <label htmlFor="login-user">Correo electrónico</label>
              <div className="field__control">
                <Mail size={18} className="field__icon" />
                <input
                  id="login-user"
                  type="text"
                  inputMode="email"
                  autoComplete="username"
                  placeholder="nombre@empresa.com"
                  autoFocus
                  aria-invalid={!!errors.user}
                  {...register("user", { required: true })}
                />
              </div>
              {errors.user && <p className="field__error">Ingresa tu correo</p>}
            </div>

            <div className={`field${errors.password ? " field--error" : ""}`}>
              <label htmlFor="login-password">Contraseña</label>
              <div className="field__control">
                <Lock size={18} className="field__icon" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="has-toggle"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  {...register("password", { required: true, minLength: 3 })}
                />
                <button
                  type="button"
                  className="field__toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="field__error">Ingresa tu contraseña</p>}
            </div>

            {error && (
              <div className="login__alert" role="alert">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="login__submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="login__spinner" /> Ingresando…
                </>
              ) : (
                <>
                  Iniciar sesión <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="login__legal">Analytics by Tecnología Funcional</p>
        </div>
      </main>
    </div>
  );
};

export default Login;
