import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className="flex h-screen items-center justify-center bg-gray-100">

      <h1 className='text-4xl font-bold text-blue-600'>Hola mundo!!</h1>
    </div>
    </>
  )
}

export default App
