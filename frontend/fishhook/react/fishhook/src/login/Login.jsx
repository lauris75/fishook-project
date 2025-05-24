import "./Login.scss"
import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [inputs, setInputs] = useState({
    email: "",
    password: ""
  });
  
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) {
      setError(null);
    }
  };
  
  const getErrorMessage = (errorResponse) => {
    if (errorResponse?.status === 401) {
      return "Invalid email or password";
    }
    
    if (errorResponse?.status === 403) {
      return "Your account has been suspended. Please contact support.";
    }
    
    if (errorResponse?.status === 404) {
      return "User with this email was not found";
    }
    
    if (errorResponse?.status === 400) {
      return errorResponse?.message;
    }
    
    if (errorResponse?.status >= 500) {
      return "Server error. Please try again later.";
    }
    
    if (!errorResponse?.status) {
      return "Unable to connect to the server. Please check your internet connection.";
    }
    
    return errorResponse?.message || "Login failed. Please try again.";
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
        
    if (!inputs.email || !inputs.password) {
      setError({
        message: "Email and password are required"
      });
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputs.email)) {
      setError({
        message: "Please enter a valid email address"
      });
      setIsLoading(false);
      return;
    }
        
    try {
      const response = await axios.post("http://localhost:8081/auth/login", inputs);
            
      if (response.data && response.data.token) {
        login(response.data.user, response.data.token);
        navigate("/");
      } else {
        setError({
          message: "Invalid response from server. Please try again."
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      
      let errorMessage = "An unexpected error occurred";
      
      if (err.response?.data) {
        errorMessage = getErrorMessage(err.response.data);
      } else if (err.request) {
        errorMessage = "Unable to connect to the server. Please check your internet connection and try again.";
      } else {
        errorMessage = "An unexpected error occurred. Please try again.";
      }
      
      setError({
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <input 
              type="email" 
              placeholder="Email" 
              name="email" 
              value={inputs.email}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="email"
            />
            <input 
              type="password" 
              placeholder="Password" 
              name="password" 
              value={inputs.password}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="current-password"
            />
            {error && (
              <div className="error-container">
                <div className="error-message">{error.message}</div>
              </div>
            )}
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Logging in" : "Login"}
            </button>
          </form>
        </div>
        <div className="right">
          <h1>Welcome to Fishhook</h1>
          <p>New User?</p>
          <div>
            <Link to="/register">
              <button>Register</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login