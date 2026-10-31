/** Enlace a otro sitio: se abre en una pestaña nueva y lo avisa a los lectores de pantalla. */
export default function ExternalLink({ href, className, children, ...props }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...props}>
      {children}
      <span className="visually-hidden"> (se abre en una pestaña nueva)</span>
    </a>
  );
}
