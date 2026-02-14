import { createContext, useContext, useState, type ReactNode } from "react";
import { NotificationModal } from "../components/NotificationModal";

export type NotificationType = "success" | "error";

export interface Notification {
  type: NotificationType;
  title: string;
  message?: string;
}

interface NotificationContextType {
  notify: (notification: Notification) => void;
  clear: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null);

  const notify = (data: Notification) => {
    setNotification(data);
  };

  const clear = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ notify, clear }}>
      {children}

      {notification && (
        <NotificationModal
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={clear}
        />
      )}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotification must be used inside <NotificationProvider />"
    );
  }
  return ctx;
};