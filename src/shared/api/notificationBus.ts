type Notification = {
  type: "success" | "error";
  title: string;
  message?: string;
};

type Listener = (data: Notification) => void;

class NotificationBus {
  private listener: Listener | null = null;

  subscribe(fn: Listener) {
    this.listener = fn;
  }

  emit(data: Notification) {
    this.listener?.(data);
  }
}

export const notificationBus = new NotificationBus();