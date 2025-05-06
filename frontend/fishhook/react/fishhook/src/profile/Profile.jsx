import "./Profile.scss";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import { api } from "../context/AuthContext";
import Posts from "../components/posts/Posts";

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Check if we're viewing our own profile
  const userId = id ? parseInt(id) : currentUser.id;
  const isOwnProfile = userId === currentUser.id;
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (isOwnProfile) {
          setProfile(currentUser);
          setLoading(false);
          return;
        }
        
        const response = await api.get(`/user/${id}`);
        setProfile(response.data);
        
        try {
          const followResponse = await api.get(`/following/check/${id}`);
          setIsFollowing(followResponse.data);
        } catch (followErr) {
          console.error("Error checking follow status:", followErr);
          setIsFollowing(false);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch profile");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, currentUser, isOwnProfile]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        const followingResponse = await api.get(`/following`);
        const relationship = followingResponse.data.find(follow => 
          follow.follower === currentUser.id && follow.followee === parseInt(id)
        );
        
        if (relationship) {
          await api.delete(`/following/${parseInt(id)}`);
        }
      } else {
        await api.post('/following', {
          follower: currentUser.id,
          followee: parseInt(id)
        });
      }
      
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };

  if (loading) return <div className="profile">Loading profile...</div>;
  if (error) return <div className="profile">Error: {error}</div>;
  if (!profile) return <div className="profile">Profile not found</div>;

  return (
    <div className="profile">
      <div className="images">
        <img 
          src={profile.coverPicture || "https://images.unsplash.com/photo-1529230117010-b6c436154f25?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"} 
          alt="Cover" 
          className="cover" 
        />
        <img 
          src={profile.profilePicture} 
          alt="Profile" 
          className="profile" 
        />
      </div>
      <div className="profileContainer">
        <div className="name">{profile.name} {profile.lastname}</div>
        <div className="about">{profile.description || "No description available"}</div>
        <div className="action">
          {!isOwnProfile ? (
            <button onClick={handleFollow}>
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          ) : (
            <button>Edit Profile</button>
          )}
        </div>
      </div>
      <div className="posts">
        <Posts userId={profile.id} />
      </div>
    </div>
  );
};

export default Profile;