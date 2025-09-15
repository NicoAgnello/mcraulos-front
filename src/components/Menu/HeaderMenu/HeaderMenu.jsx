import '../HeaderMenu/HeaderMenu.css'
import { IoChevronBackCircle } from "react-icons/io5";
import logoMcRaulos from "/src/assets/logos/logoMcRaulos.svg";
import { useNavigate } from "react-router-dom";

export const HeaderMenu = () => {
const navigate = useNavigate();

    return(
        <>
            <header className='bg-red-mcraulos flex items-center justify-between px-10 pt-5 pb-2'>
                <button onClick={() => navigate(-1)} aria-label="Volver atrás">
                    <IoChevronBackCircle size={50}/>
                </button>
                <h1 className="font-pacifico text-5xl title-mcraulos-menu">McRaulos</h1>
                <img src={logoMcRaulos} alt="logoMcRaulos" className="h-20" />
            </header>
        </>
    )
}