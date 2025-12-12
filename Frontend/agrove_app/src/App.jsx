import React from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './Components/Navbar.jsx'
import Home from './Components/Home.jsx'
import Login from './Components/Login.jsx'
import Signup from './Components/Signup.jsx'
import Dashboard from './Components/Dashboard.jsx'
import Profile from './Components/UserProfile.jsx'

const App = () => {
  return (
    <Router>
      <div className="app-main">
        
        {/* The Routes determine which component shows up based on the URL */}
        <Routes>
          <Route path="/" element={<Home />} />
         
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
         <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} /> 
        </Routes>

        <Navbar />
        
      </div>
    </Router>
  )
}

export default App
