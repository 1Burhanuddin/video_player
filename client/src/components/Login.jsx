import { login } from '../api';

// ... in your component
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await login({ username, password });
    if (response.ok) {
      // Handle successful login
    } else {
      // Handle error
    }
  } catch (error) {
    console.error('Login error:', error);
  }
}; 