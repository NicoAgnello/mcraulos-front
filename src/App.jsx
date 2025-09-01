import { useState } from 'react'
import './App.css'
import { Header } from './components/Header/Header.jsx'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className='flex item-center justify-center bg-red-600 p-5'>
      <Header></Header>    
    </div>
    </>
  )
}

export default App
