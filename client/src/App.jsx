import { useState, useEffect } from 'react'
import './App.css'
import SecureVideo from './components/SecureVideo'
import { checkSession } from './api'

const API_URL = import.meta.env.PROD 
  ? 'https://video-player-s.vercel.app/api'
  : '/api'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
    // Force logout on every page refresh
    fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
    }).finally(() => {
      localStorage.removeItem('devtools_detected'); // Optional: reset devtools flag
      setIsLoggedIn(false);
      setIsLoading(false);
    });
  }, []);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await checkSession();
        if (response.ok) {
          console.log('Session valid')
          setIsLoggedIn(true)
        } else {
          console.log('No valid session')
          setIsLoggedIn(false)
        }
      } catch (error) {
        console.error('Session check error:', error);
        setIsLoggedIn(false)
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Attempting login...')
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      })
      const data = await response.json()
      
      if (response.ok) {
        console.log('Login successful')
        setIsLoggedIn(true)
      } else {
        console.error('Login failed:', data.message)
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred during login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      console.log('Attempting logout...')
      const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
      })
      const data = await response.json()
      
      if (response.ok) {
        console.log('Logout successful')
        setIsLoggedIn(false)
        setUsername('')
        setPassword('')
      } else {
        console.error('Logout failed:', data.message)
        setError('Logout failed')
      }
    } catch (err) {
      console.error('Logout error:', err)
      setError('An error occurred during logout')
    } finally {
      setIsLoading(false)
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
              disabled={isLoading}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          {error && <p className="error">{error}</p>}
        </div>
      ) : (
        <div className="video-container">
          <h1>Video Player</h1>
          <SecureVideo />
          <button 
            onClick={handleLogout} 
            className="logout-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      )}
    </div>
  )
}

export default App
