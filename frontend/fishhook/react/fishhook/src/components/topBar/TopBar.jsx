import "./TopBar.scss"
import PhishingIcon from '@mui/icons-material/Phishing';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthContext } from "../../context/AuthContext.js"; 
import { Link, useNavigate} from "react-router-dom";
import { useContext } from "react";

const TopBar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout(); // Call the logout function from the context
    navigate("/login"); // Navigate to the login page
  };
  
  return (
    <div className="topBar">
      <div className="left">
        <Link to="/" style={{textDecoration:"none"}}>Fishhook<PhishingIcon style={{ fontSize: 40 }}/></Link>
      </div>
      <div className="center">
        <SearchIcon style={{ fontSize: 40 }}/>
        <input type="text" placeholder="Search"/>
      </div>
      <div className="right">
        <div className="logoutContainer" onClick={handleLogout} style={{cursor: "pointer"}}>
          <span>Log out</span><LogoutIcon style={{ fontSize: 40 }}/>
        </div>
      </div>
    </div>
  )
}

export default TopBar