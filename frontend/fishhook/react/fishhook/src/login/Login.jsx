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
  
  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
        
    if (!inputs.email || !inputs.password) {
      setError({
        status: 400,
        message: "Email and password are required",
        errorCode: "MISSING_FIELDS"
      });
      return;
    }
        
    try {
      const response = await axios.post("http://localhost:8081/auth/login", inputs);
            
      if (response.data && response.data.token) {
        // Pass both the user data AND the token to the login function
        login(response.data.user, response.data.token);
        navigate("/");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data);
        console.log("Login error:", err.response.data);
      } else {
        setError({
          status: 500,
          message: "An unexpected error occurred",
          errorCode: "UNKNOWN_ERROR"
        });
      }
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
              onChange={handleChange}
            />
            <input 
              type="password" 
              placeholder="Password" 
              name="password" 
              onChange={handleChange}
            />
            {error && (
              <div className="error-container">
                <div className="error-message">{error.message}</div>
              </div>
            )}
            <button type="submit">Login</button>
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