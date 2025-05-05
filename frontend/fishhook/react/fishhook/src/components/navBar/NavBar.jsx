import "./NavBar.scss"
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import Diversity3OutlinedIcon from '@mui/icons-material/Diversity3Outlined';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import WaterOutlinedIcon from '@mui/icons-material/WaterOutlined';
import FishIcon from "../../assets/fish_icon.png";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const NavBar = () => {

  const { currentUser } = useContext(AuthContext);

  return (
    <div className="navBar">
      <div className="container">
        <div className="menu">
          <img
            src={currentUser.profilePicture}
            alt=""
          />
          <span>{ currentUser.name }</span>
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