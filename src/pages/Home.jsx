// pages/Home.jsx
import { Header } from '../components/Home/Header/Header.jsx'
import { LanguageSelector } from '../components/Home/LenguageSelector/LenguageSelector.jsx'
import {ServiceMode} from '../components/Home/ServiceMode/ServiceMode.jsx'
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import '../index.css'

export const Home = ()=> {
  //Lenguaje
  const [lang, setLang] = useState("es");
  //Para llevar o Comer Aqui
  const [serviceMode, setServiceMode] = useState(() => 
    localStorage.getItem("serviceMode") || null
  );
  //Cambio de pagina -- Menu 
  const navigate = useNavigate();
  const handleMode = (mode) => {
    setServiceMode(mode);                 // 1) Guardamos estado de donde come.
    localStorage.setItem("serviceMode", mode); // 2) Persistimos en localstorage.
    navigate("/menu");
  };

  return (
    <div className="flex flex-col items-center justify-center bg-red-mcraulos p-5 min-h-screen">
      <Header />
      <LanguageSelector defaultValue={lang} onChange={setLang} />
      <ServiceMode onSelect={handleMode}/>
    </div>
  )
}