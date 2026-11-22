import PageHeader from "../components/layout/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import StatusMessage from "../components/ui/StatusMessage.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { paths } from "../utils/routes.js";

export default function NotFoundPage() {
  useDocumentTitle("Página no encontrada");

  return (
    <>
      <PageHeader eyebrow="Error 404" title="Página no encontrada" />
      <div className="container">
        <StatusMessage
          tone="info"
          title="Esta dirección no existe"
          action={
            <>
              <Button to={paths.home}>Ir al inicio</Button>
              <Button to={paths.disponibilidad} variant="outline">
                Ver fechas libres
              </Button>
            </>
          }
        >
          Puede que el enlace esté mal escrito o que la página se haya movido.
        </StatusMessage>
      </div>
    </>
  );
}
