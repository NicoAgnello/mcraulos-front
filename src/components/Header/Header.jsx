import "./Header.css";
import logo from "/src/assets/logo-mcraulos.svg";
export const Header = () => {
  return (
    <>
      <header>
        <img src={logo} alt="logoMcRaulos" className="h-60 " />
        <h1 className="font-pacifico text-7xl pt-8">McRaulo's</h1>
      </header>
    </>
  );
};
