import "./Header.css";
import logo from "/src/assets/logos/burger.svg";
import { Typewriter } from 'react-simple-typewriter'
import logo1 from "../../assets/logos/logo1.0.svg";
export const Header = () => {
  return (
    <>
      <header className="flex flex-col items-center justify-center">
        <div className="flex items-center media-column">
          <img src={logo1} alt="logoMcRaulos" className="h-60" />
          <h1 className="font-pacifico text-7xl pt-8 title-mcraulos">
          <Typewriter
            words={["McRaulo's"]}
            loop={0}           // 0 = infinito
            cursor={false}     // oculta el cursor
            typeSpeed={150}    // velocidad de escritura
            deleteSpeed={0}   // velocidad de borrado
            delaySpeed={1000}  // pausa antes de borrar/escribir de nuevo
          />
          </h1>
        </div>
      <p className="welcome-text text-4xl font-bold mb-2 pt-5">¡Bienvenido!</p>
      </header>
    </>
  );
};
