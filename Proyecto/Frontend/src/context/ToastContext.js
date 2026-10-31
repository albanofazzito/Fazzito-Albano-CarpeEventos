import { createContext } from "react";

/** Expone { success, error, info, dismiss }. Se consume con el hook useToast. */
export const ToastContext = createContext(null);

export default ToastContext;
