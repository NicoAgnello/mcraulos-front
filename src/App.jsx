// App.jsx
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import OtraPagina from './pages/OtraPagina.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/otra" element={<OtraPagina />} />
    </Routes>
  )
}

export default App
