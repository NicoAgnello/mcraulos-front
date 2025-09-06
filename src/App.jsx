// App.jsx
import { Routes, Route } from 'react-router-dom'
import {Home} from './pages/Home.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* <Route path="/menu" element={<Menu />} /> */}
    </Routes>
  )
}

export default App
