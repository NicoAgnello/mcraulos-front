import { useState } from 'react'
import './App.css'
import { Header } from './components/Header/Header.jsx'
import { LanguageSelector } from './components/LenguageSelector/LenguageSelector.jsx'
function App() {
  const [count, setCount] = useState(0)
  const [lang, setLang] = useState("es");
  return (
    <>
    <div className='flex-col items-center justify-center bg-red-mcraulos p-5'>
      <Header></Header>    
      <LanguageSelector defaultValue={lang} onChange={setLang} />
    </div>
    </>
  )
}

export default App
