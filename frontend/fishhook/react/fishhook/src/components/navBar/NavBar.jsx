import "./NavBar.scss"
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import Diversity3OutlinedIcon from '@mui/icons-material/Diversity3Outlined';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import WaterOutlinedIcon from '@mui/icons-material/WaterOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import FishIcon from "../../assets/fish_icon.png";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const NavBar = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="navBar">
      <div className="container">
        <div className="menu">
          <Link to={`/profile/${currentUser.id}`} style={{ 
            textDecoration: "none", 
            color: "inherit",
            display: "flex",
            alignItems: "center",
            gap: "20px"
          }}>
            <img
              src={currentUser.profilePicture}
              alt=""
            />
            <span>{currentUser.name}</span>
          </Link>
        </div>
        
        <Link to="/group" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="item">
            <Diversity3OutlinedIcon style={{ fontSize: 60 }}/>
            <span>Groups</span>
          </div>
        </Link>
        
        <Link to="/marketplace" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="item">
            <StoreOutlinedIcon style={{ fontSize: 60 }}/>
            <span>Marketplace</span>
          </div>
        </Link>
        
        <Link to="/fish" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="item">
            <img src={FishIcon} alt=""/>
            <span>Fish</span>
          </div>
        </Link>
        
        <Link to="/lake" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="item">
            <WaterOutlinedIcon style={{ fontSize: 60 }}/>
            <span>Lakes</span>
          </div>
        </Link>
        
        <Link to="/usefulinfo" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="item">
            <InfoOutlinedIcon style={{ fontSize: 60 }}/>
            <span>Fishing Tips</span>
          </div>
        </Link>
        
        <Link to="/chat" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="item">
            <ChatOutlinedIcon style={{ fontSize: 60 }}/>
            <span>Chat</span>
          </div>
        </Link>
        
        <Link to="/map" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="item">
            <MapOutlinedIcon style={{ fontSize: 60 }}/>
            <span>Map</span>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default NavBar