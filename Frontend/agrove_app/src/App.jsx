import React from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// --- All necessary Imports ---
import Navbar from './Components/Navbar.jsx'
import AddActivity from './Components/AddActivity.jsx'
import Home from './Components/Home.jsx'
import Login from './Components/Login.jsx'
import Signup from './Components/Signup.jsx'
import Dashboard from './Components/Dashboard.jsx'
import Profile from './Components/UserProfile.jsx'
import FloatingMenu from './Components/FloatingMenu.jsx'
import AddField from './Components/AddField.jsx'
import FieldDetails from './Components/FieldDetails.jsx'
import About from './Components/About.jsx' // Needs to be here for the separate route
import Onboarding from './Components/Onboarding.jsx'

const App = () => {
  return (
    <Router>
      <div className="app-main">

        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-field" element={<AddField />} />
          <Route path="/field/:id" element={<FieldDetails />} />
          <Route path="/add-activity" element={<AddActivity />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
        <Navbar />
        <FloatingMenu />
      </div>
    </Router>
  )
}

export default App