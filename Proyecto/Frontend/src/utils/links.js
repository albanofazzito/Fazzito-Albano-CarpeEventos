/** Enlace a un chat de WhatsApp. wa.me necesita el número solo con dígitos. */
export function buildWhatsAppUrl(telefono, mensaje) {
  const url = `https://wa.me/${String(telefono).replace(/\D/g, "")}`;
  return mensaje ? `${url}?text=${encodeURIComponent(mensaje)}` : url;
}

export function buildTelUrl(telefono) {
  return `tel:${String(telefono).replace(/[^\d+]/g, "")}`;
}

export function buildMapsUrl(direccion) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
}
