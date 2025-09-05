// pages/Home.jsx
import { Header } from '../components/Header/Header.jsx'
import { LanguageSelector } from '../components/LenguageSelector/LenguageSelector.jsx'

export default function Home() {
    const [count, setCount] = useState(0)
  const [lang, setLang] = useState("es");
  return (
    <div className="flex flex-col items-center justify-center bg-red-600 p-5 min-h-screen">
      <Header />
      <LanguageSelector defaultValue={lang} onChange={setLang} />
    </div>
  )
}