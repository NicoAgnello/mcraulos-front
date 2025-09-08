// App.jsx
import { Routes, Route } from 'react-router-dom'
import {Home} from './pages/Home.jsx'
import {Menu} from './pages/Menu.jsx'
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Menu" element={<Menu />} />
    </Routes>
  )
}

export default App
