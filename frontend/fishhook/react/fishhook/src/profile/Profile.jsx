import "./Profile.scss"
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Posts from "../components/posts/Posts.jsx"

const Profile = () => {

  const { currentUser } = useContext(AuthContext);

  return (
    <div className="profile">
      <div className="images">
        <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" alt="" className="cover"></img>
        <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" alt="" className="profile"></img>
      </div>
      <div className="profileContainer">
        <div className="name">{currentUser.name}</div>
        <div className="about">{currentUser.description}</div>
        <div className="action">
          <button>Follow</button>
          <br></br><br></br>
          <button>Update</button>
          </div>
      </div>
      <div className="posts">
        <Posts/>
      </div>
    </div>
  )
}

export default Profile