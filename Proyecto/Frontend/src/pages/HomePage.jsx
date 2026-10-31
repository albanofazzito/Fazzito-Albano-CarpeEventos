import AboutSection from "../components/home/AboutSection.jsx";
import ContactoSection from "../components/home/ContactoSection.jsx";
import GaleriaSection from "../components/home/GaleriaSection.jsx";
import Hero from "../components/home/Hero.jsx";
import ServiciosSection from "../components/home/ServiciosSection.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

/** Landing del boceto original: Hero, Sobre nosotros, Servicios, Galería y Contacto. */
export default function HomePage() {
  useDocumentTitle();

  return (
    <>
      <Hero />
      <AboutSection />
      <ServiciosSection />
      <GaleriaSection />
      <ContactoSection />
    </>
  );
}
