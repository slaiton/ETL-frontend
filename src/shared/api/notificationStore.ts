type NotifyFn = (msg: string) => void;

let successFn: NotifyFn;
let errorFn: NotifyFn;

export const notificationStore = {
  bind(success: NotifyFn, error: NotifyFn) {
    successFn = success;
    errorFn = error;
  },
  success(msg: string) {
    successFn?.(msg);
  },
  error(msg: string) {
    errorFn?.(msg);
  },
};