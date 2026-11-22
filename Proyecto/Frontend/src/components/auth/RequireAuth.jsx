import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth.js";
import { paths } from "../../utils/routes.js";
import PageHeader from "../layout/PageHeader.jsx";
import Button from "../ui/Button.jsx";
import Loader from "../ui/Loader.jsx";
import StatusMessage from "../ui/StatusMessage.jsx";

/**
 * Protege un grupo de rutas. Sin sesión, manda a "Ingresar" recordando a
 * dónde se quería ir (para volver después del login). Si se indican
 * `roles`, además verifica que el usuario tenga uno de ellos.
 *
 * Es una ayuda de navegación: la protección real la hace la API, que
 * rechaza cualquier petición sin el token o el rol correspondiente.
 */
export default function RequireAuth({ roles }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return <Loader label="Verificando tu sesión…" />;
  }

  if (!usuario) {
    return <Navigate to={paths.ingresar} replace state={{ desde: location }} />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    return (
      <>
        <PageHeader eyebrow="Acceso restringido" title="No tenés acceso a esta sección" />
        <div className="container">
          <StatusMessage
            tone="info"
            title="Esta pantalla es para otro tipo de usuario"
            action={<Button to={paths.eventos}>Ir a mis eventos</Button>}
          >
            Tu usuario ({usuario.rol}) no tiene permiso para ver esta parte del sistema.
          </StatusMessage>
        </div>
      </>
    );
  }

  return <Outlet />;
}
