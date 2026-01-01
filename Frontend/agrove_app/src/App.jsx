// import React from 'react'
// import './App.css'
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// // --- All necessary Imports ---
// import Navbar from './Components/Navbar.jsx'
// import AddActivity from './Components/AddActivity.jsx'
// import Home from './Components/Home.jsx'
// import Login from './Components/Login.jsx'
// import Signup from './Components/Signup.jsx'
// import Dashboard from './Components/Dashboard.jsx'
// import Profile from './Components/UserProfile.jsx'
// import FloatingMenu from './Components/FloatingMenu.jsx'
// import AddField from './Components/AddField.jsx'
// import Plan from './Components/Plan.jsx'
// import Bin from './Components/Bin.jsx'
// import FieldDetails from './Components/FieldDetails.jsx'
// import EditPage from './Components/Edit.jsx'
// import Onboarding from './Components/Onboarding.jsx'
// import GlobalBackground from './Components/GlobalBackground.jsx'



// const App = () => {
//   return (
//     <Router>
//       <div className="app-main">
//         <GlobalBackground />

//         <Routes>
//           <Route path="/" element={<Home />} />

//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<Signup />} />
//           <Route path="/profile" element={<Profile />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/add-field" element={<AddField />} />
//           <Route path="/field/:id" element={<FieldDetails />} />
//           <Route path="/edit/:type/:id" element={<EditPage />} />
//           <Route path="/add-activity" element={<AddActivity />} />
//           <Route path="/plan" element={<Plan />} />
//           <Route path="/onboarding" element={<Onboarding />} />
//           <Route path="/bin" element={<Bin />} />
//           <Route path="/" element={<Home />} />
//         <Route path="/dashboard" element={<Dashboard />} />

//         </Routes>
//         <Navbar />
//         <FloatingMenu />
//       </div>
//     </Router>
//   )
// }

// export default App


import React from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Navbar from './Components/Navbar.jsx'
import AddActivity from './Components/AddActivity.jsx'
import Home from './Components/Home.jsx'
import Login from './Components/Login.jsx'
import Signup from './Components/Signup.jsx'
import Dashboard from './Components/Dashboard.jsx'
import Profile from './Components/UserProfile.jsx'
import FloatingMenu from './Components/FloatingMenu.jsx'
import AddField from './Components/AddField.jsx'
import Plan from './Components/Plan.jsx'
import Bin from './Components/Bin.jsx'
import FieldDetails from './Components/FieldDetails.jsx'
import EditPage from './Components/Edit.jsx'
import Onboarding from './Components/Onboarding.jsx'
import GlobalBackground from './Components/GlobalBackground.jsx'

const App = () => {
  return (
    <Router>
      <div className="app-main">
        <GlobalBackground />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-field" element={<AddField />} />
          <Route path="/field/:id" element={<FieldDetails />} />
          <Route path="/edit/:type/:id" element={<EditPage />} />
          <Route path="/add-activity" element={<AddActivity />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/bin" element={<Bin />} />
        </Routes>

        {/* These components sit outside Routes so they are visible on every page */}
        <Navbar />
        <FloatingMenu />
      </div>
    </Router>
  )
}

export default App