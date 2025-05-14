import { useState } from 'react'
import './App.css'
import SecureVideo from './components/SecureVideo'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
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
        setIsLoggedIn(true)
        setError('')
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('An error occurred during login')
    }
  }

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
    <div className="app">
      {!isLoggedIn ? (
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
      ) : (
        <div className="video-container">
          <h1>Video Player</h1>
          <SecureVideo />
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default App
