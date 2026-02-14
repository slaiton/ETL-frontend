interface Props {
  type: "success" | "error";
  title: string;
  message?: string;
  onClose: () => void;
}

export function NotificationModal({
  type,
  title,
  message,
  onClose,
}: Props) {
  const isSuccess = type === "success";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div
        className={`
          w-[90%] max-w-sm rounded-2xl p-6
          ${isSuccess ? "bg-emerald-600" : "bg-red-600"}
          text-white shadow-xl
          animate-scale-in
        `}
      >
        <h3 className="text-lg font-semibold mb-2">
          {title}
        </h3>

        {message && (
          <p className="text-sm opacity-90">
            {message}
          </p>
        )}

        <button
          onClick={onClose}
          className="
            mt-5 w-full py-2 rounded-xl
            bg-white/20 hover:bg-white/30
            transition
          "
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}