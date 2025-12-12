<<<<<<< HEAD
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
=======
import React from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './Components/Navbar.jsx'
import Home from './Components/Home.jsx'
import Login from './Components/Login.jsx'
import Signup from './Components/Signup.jsx'

const App = () => {
  return (
    <Router>
      <div className="app-main">
        
        {/* The Routes determine which component shows up based on the URL */}
        <Routes>
          <Route path="/" element={<Home />} />
         
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        { /*  <Route path="/profile" element={<Profile />}
        <Route path="/dashboard" element={<Dashboard />} /> />*/}
        </Routes>

        {/* Navbar is placed OUTSIDE Routes so it stays visible on every page */}
        <Navbar />
        
      </div>
    </Router>
  )
}

export default App
>>>>>>> 48ab030 (feat: initialize frontend with React, Vite, and essential styles)
