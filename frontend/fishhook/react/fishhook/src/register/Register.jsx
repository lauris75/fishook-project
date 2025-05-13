import "./Register.scss"
import { AuthContext } from "../context/AuthContext"; 
import { Link, useNavigate} from "react-router-dom";
import { useState, useContext } from "react";
import axios from "axios";

const Register = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [inputs, setInputs] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    date: ""
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
  e.preventDefault();
  setError(null);
  
  if (inputs.password !== inputs.confirmPassword) {
    setError({
      status: 400,
      message: "Passwords do not match",
      errorCode: "PASSWORD_MISMATCH"
    });
    return;
  }
  
  if (!inputs.name || !inputs.surname || !inputs.email || !inputs.password || !inputs.date) {
    setError({
      status: 400,
      message: "All fields are required",
      errorCode: "MISSING_FIELDS"
    });
    return;
  }

  try {
    const { confirmPassword, ...dataToSend } = inputs;
    const response = await axios.post("http://localhost:8081/auth/register", dataToSend);
    
    if (response.data && response.data.token) {
      if (response.data.user) {
        login(response.data.user, response.data.token);
        navigate("/");
      }
    }
  } catch (err) {
    if (err.response && err.response.data) {
      setError(err.response.data);
      console.log("Registration error:", err.response.data);
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
    <div className="register">
      <div className="card">
        <div className="left">
          <p>Welcome to our Fishermen Social, the ultimate online community 
            for passionate anglers and fishing enthusiasts. 
            Whether you're an experienced angler or just starting out, 
            this app is designed to connect you with a vibrant community of fellow fishermen from around the world.</p>
          <p>At Fishermen Social, we understand the thrill of the catch, 
            the joy of being out on the water, and the stories that come with 
            every fishing adventure. Our app provides a platform where you can 
            share your fishing experiences, exchange tips and techniques, showcase your 
            impressive catches, and connect with others who share your love for the sport.</p>
          <span>Already have an account?</span>
          <div>
            <Link to="/login">
              <button>Login</button>
            </Link>
          </div>
        </div>

        <div className="right">
          <h1>Register</h1>
          <form onSubmit={handleRegister}>
            <input type="text" placeholder="Name" name="name" onChange={handleChange} />
            <input type="text" placeholder="Surname" name="surname" onChange={handleChange} />
            <input type="email" placeholder="Email" name="email" onChange={handleChange} />
            <input type="password" placeholder="Password" name="password" onChange={handleChange} />
            <input type="password" placeholder="Confirm password" name="confirmPassword" onChange={handleChange}/>
            <input type="date" min="1900-01-01" max="2023-01-01" placeholder="DateOfBirth" name="date" onChange={handleChange} />
            {error && (
              <div className="error-container">
                <div className="error-message">{error.message}</div>
              </div>
            )}
            <button type="submit">Register</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
