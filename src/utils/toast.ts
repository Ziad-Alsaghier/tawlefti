import { toast, type ExternalToast } from "sonner";

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showError = (message: string) => {
  toast.error(message);
};

export const showLoading = (message: string, data?: ExternalToast) => {
  return toast.loading(message, data);
};

export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};