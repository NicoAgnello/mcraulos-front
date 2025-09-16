// App.jsx
import { Routes, Route } from 'react-router-dom'
import {Home} from './pages/Home.jsx'
import {Menu} from './pages/Menu.jsx'
import {Cart} from './pages/Cart.jsx'
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Menu" element={<Menu />} />
      <Route path="/Cart" element={<Cart />} />
    </Routes>
  )
}

export default App
