import "./NavBar.scss"
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import Diversity3OutlinedIcon from '@mui/icons-material/Diversity3Outlined';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import WaterOutlinedIcon from '@mui/icons-material/WaterOutlined';
import FishIcon from "../../assets/fish_icon.png";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom"; // Add this import

const NavBar = () => {

  const { currentUser } = useContext(AuthContext);

  return (
    <div className="navBar">
      <div className="container">
        <div className="menu">
          {/* Wrap the profile image and name in a Link component */}
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
        <div className="item">
          <Diversity3OutlinedIcon style={{ fontSize: 60 }}/>
          <span>Groups</span>
        </div>
        <div className="item">
          <StoreOutlinedIcon style={{ fontSize: 60 }}/>
          <span>Marketplace</span>
        </div>
        <div className="item">
          <img src={FishIcon} alt=""/>
          <span>Fish</span>
        </div>
        <div className="item">
          <WaterOutlinedIcon style={{ fontSize: 60 }}/>
          <span>Lakes</span>
        </div>
        <div className="item">
          <ChatOutlinedIcon style={{ fontSize: 60 }}/>
          <span>Chat</span>
        </div>
      </div>
    </div>
  )
}

export default NavBar