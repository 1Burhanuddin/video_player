import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import SecureVideo from './components/SecureVideo'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      })
      const data = await response.json()
      if (response.ok) {
        onLogin()
        setError('')
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('An error occurred during login')
    }
  }

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  )
}

function VideoPlayer({ onLogout }) {
  return (
    <div className="video-container">
      <h1>Video Player</h1>
      <SecureVideo />
      <button onClick={onLogout} className="logout-button">
        Logout
      </button>
    </div>
  )
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        credentials: 'include'
      })
      setIsLoggedIn(false)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/" 
            element={
              isLoggedIn ? (
                <VideoPlayer onLogout={handleLogout} />
              ) : (
                <Login onLogin={() => setIsLoggedIn(true)} />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App 