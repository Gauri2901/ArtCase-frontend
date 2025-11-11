import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Navbar from './components/layout/Navbar';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar/>
      <h1 className="text-3xl font-bold text-center mt-10">
        Welcome to Art-Case
      </h1>
    </>
  )
}

export default App
