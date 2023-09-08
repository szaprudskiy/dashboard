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

  const handleLogout = () => {
    localStorage.setItem('isAuthenticated', 'false')
    setIsAuthenticated(false)
  }

  return (
    <Router>
      <Routes>
        {/* Обрабатываем корневой путь */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />
        {!isAuthenticated && <Route path="/register" element={<Register />} />}
        {isAuthenticated && (
          <Route path="/register" element={<Navigate to="/dashboard" />} />
        )}
        {isAuthenticated ? (
          <Route
            path="/dashboard"
            element={<Dashboard handleLogout={handleLogout} />}
          />
        ) : (
          // Добавляем корневой маршрут, чтобы совпадать с любым путем и перенаправлять на /login, если не залогинен
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  )
}

export default App
