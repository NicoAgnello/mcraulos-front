import '../HeaderMenu/HeaderMenu.css'
import { IoChevronBackCircle } from "react-icons/io5";
import logoMcRaulos from "/src/assets/logos/logoMcRaulos.svg";

export const HeaderMenu = () => {


    return(
        <>
            <header className='bg-red-mcraulos flex items-center justify-between px-10 pt-5 pb-2'>
                <IoChevronBackCircle size={50}/>
                <h1 className="font-pacifico text-5xl title-mcraulos-menu">McRaulos</h1>
                <img src={logoMcRaulos} alt="logoMcRaulos" className="h-20" />
            </header>
        </>
    )
}