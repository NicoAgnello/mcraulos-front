// pages/Menu.jsx
import { HeaderMenu } from '../components/Menu/HeaderMenu/HeaderMenu'
import { useState } from 'react';
import '../index.css'

export const Menu = ()=> {
  

  return (
    <div className="flex flex-col items-center justify-center bg-red-mcraulos p-5 min-h-screen">
        <h1>menu</h1>
      <HeaderMenu />
    </div>
  )
}