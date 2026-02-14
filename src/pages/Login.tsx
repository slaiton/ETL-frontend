import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../shared/context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      await login(data.user, data.password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 overflow-hidden">

      {/* Efecto decorativo blur */}
      <div className="absolute w-96 h-96 bg-blue-600 opacity-30 rounded-full blur-3xl top-10 -left-20 animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-blue-400 opacity-20 rounded-full blur-3xl bottom-10 -right-20 animate-pulse"></div>

      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-10 w-full max-w-md text-white animate-fadeIn">
        
        <h2 className="text-3xl font-bold text-center mb-2">
          Bienvenido
        </h2>
        <p className="text-center text-blue-200 mb-8">
          Ingresa tus credenciales para continuar
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Usuario */}
          <div>
            <label className="block text-sm mb-1 text-blue-200">
              Usuario
            </label>
            <input
              type="text"
              {...register("user", { required: true })}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 
                         focus:outline-none focus:ring-2 focus:ring-blue-400 
                         transition-all duration-300"
              placeholder="Ingresa tu usuario"
              autoFocus
            />
            {errors.user && (
              <p className="text-red-300 text-sm mt-1">
                El usuario es obligatorio
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-1 text-blue-200">
              Contraseña
            </label>
            <input
              type="password"
              {...register("password", { required: true, minLength: 3 })}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 
                         focus:outline-none focus:ring-2 focus:ring-blue-400 
                         transition-all duration-300"
              placeholder="Ingresa tu contraseña"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400 text-red-200 p-2 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 
                       transition-all duration-300 font-semibold shadow-lg 
                       hover:shadow-blue-500/40 disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Iniciar sesión"}
          </button>
        </form>

        {/* <div className="text-center mt-6 text-sm text-blue-200">
          ¿No tienes cuenta?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-blue-400 hover:text-blue-300 font-semibold transition"
          >
            Regístrate aquí
          </button>
        </div> */}
      </div>

      {/* Animación personalizada */}
      <style>
        {`
          .animate-fadeIn {
            animation: fadeIn 0.8s ease-out;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Login;