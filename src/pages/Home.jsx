// pages/Home.jsx
import { Header } from '../components/Home/Header/Header.jsx'
import { LanguageSelector } from '../components/Home/LenguageSelector/LenguageSelector.jsx'
import { ServiceMode } from '../components/Home/ServiceMode/ServiceMode.jsx'
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider.jsx"; //
import '../index.css'

export const Home = ()=> {
  const { lang } = useI18n(); // por si querés mostrar algo condicional por idioma

  //Para llevar o Comer Aqui
  const [serviceMode, setServiceMode] = useState(() => 
    localStorage.getItem("serviceMode") || null
  );

  const navigate = useNavigate();
  const handleMode = (mode) => {
    setServiceMode(mode);
    localStorage.setItem("serviceMode", mode);
    navigate("/menu");
  };

  return (
    <div className="flex flex-col items-center justify-center bg-red-mcraulos p-5 min-h-screen">
      <Header />
      {/* Ya no pasamos defaultValue/onChange si no querés; el selector usa el contexto */}
      <LanguageSelector />
      <ServiceMode onSelect={handleMode}/>
    </div>
  )
}