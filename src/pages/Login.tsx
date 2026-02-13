import { useState,useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../shared/context/AuthContext";

import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
  if (isAuthenticated) {
    navigate("/home", { replace: true });
  }
}, [isAuthenticated, navigate]);


  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      await login(data.user, data.password);
      navigate("/home");
    } catch (err: any) {
      console.log(err);

      setError(err.message || "Error al iniciar sesión");
      // No navega a ningún lado si hay error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-black mb-6">Iniciar sesión</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="text"
              {...register("user", { required: true })}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-300 text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
            {errors.email && <p className="text-red-400">El correo es obligatorio</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              {...register("password", { required: true, minLength: 3 })}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-gray-300 text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta?
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="ml-1 text-blue-600 font-medium hover:underline"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Login;