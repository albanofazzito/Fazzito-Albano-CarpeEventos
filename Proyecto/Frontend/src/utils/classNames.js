/** Une clases CSS ignorando las condicionales falsas: cx("a", activo && "b"). */
export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
