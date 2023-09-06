import React, { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom'

import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Dashboard from './components/admin/Dashboard'

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  )

  useEffect(() => {
    // Проверяем состояние авторизации в localStorage
    const savedAuth = localStorage.getItem('isAuthenticated')
    if (savedAuth === 'true') {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />
        {isAuthenticated ? (
          <Route path="/dashboard" element={<Dashboard />} />
        ) : (
          <Route path="/" element={<Navigate replace to="/login" />} />
        )}
      </Routes>
    </Router>
  )
}

export default App
