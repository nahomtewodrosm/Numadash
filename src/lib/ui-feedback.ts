export type ToastKind = "success" | "error" | "info";

export function showToast(message: string, kind: ToastKind = "info"): void {
  window.dispatchEvent(
    new CustomEvent("numa:toast", { detail: { message, kind } }),
  );
}

export function setGlobalLoading(active: boolean): void {
  window.dispatchEvent(new Event(active ? "numa:loading-start" : "numa:loading-end"));
}
