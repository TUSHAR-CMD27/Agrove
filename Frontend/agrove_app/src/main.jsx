// import { StrictMode,Suspense } from 'react'
// import { createRoot } from 'react-dom/client'
// import { GoogleOAuthProvider } from '@react-oauth/google'
// import './index.css'
// import App from './App.jsx'
// import { Toaster } from 'react-hot-toast'
// import './i18n'

// // Replace with your Google OAuth Client ID from Google Cloud Console
// const GOOGLE_CLIENT_ID = "823703719356-j30njedrdo89saqn9h6ojvamujt0aung.apps.googleusercontent.com"

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
//       <App />
//       <Toaster /> 
//     </GoogleOAuthProvider>
//   </StrictMode>,
// )



import { StrictMode, Suspense } from 'react' // Added Suspense
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'
import './i18n'

const GOOGLE_CLIENT_ID = "823703719356-j30njedrdo89saqn9h6ojvamujt0aung.apps.googleusercontent.com"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {/* Suspense handles the loading of your translation files */}
      <Suspense fallback={<div style={{color: 'white', textAlign: 'center', marginTop: '20%'}}>Loading...</div>}>
        <App />
        <Toaster /> 
      </Suspense>
    </GoogleOAuthProvider>
  </StrictMode>,
)