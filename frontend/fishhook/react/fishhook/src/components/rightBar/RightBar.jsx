import "./RightBar.scss"
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const RightBar = () => {
  const { currentUser, api } = useContext(AuthContext);
  const [following, setFollowing] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [error, setError] = useState(null);

  // Fetch following data
  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        // Get users that the current user is following
        const followingResponse = await api.get(`/following`);
        
        // For each following relationship, fetch the user data
        const followersData = await Promise.all(
          followingResponse.data.map(async (follow) => {
            // Get user data for each followee
            const userResponse = await api.get(`/user/${follow.followee}`);
            return userResponse.data;
          })
        );
        
        setFollowing(followersData);
        setLoadingFollowing(false);
      } catch (err) {
        console.error("Error fetching following:", err);
        setError("Failed to load following");
        setLoadingFollowing(false);
      }
    };

    if (currentUser?.id) {
      fetchFollowing();
    }
  }, [currentUser, api]);

  // Fetch group data
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // First get all group members for current user
        const groupMembersResponse = await api.get('/groupMember');
        const userGroups = groupMembersResponse.data.filter(
          member => member.userId === currentUser.id
        );
        
        // For each group membership, fetch the group data
        const groupsData = await Promise.all(
          userGroups.map(async (membership) => {
            const groupResponse = await api.get(`/group/${membership.groupId}`);
            return groupResponse.data;
          })
        );
        
        setGroups(groupsData);
        setLoadingGroups(false);
      } catch (err) {
        console.error("Error fetching groups:", err);
        setError("Failed to load groups");
        setLoadingGroups(false);
      }
    };

    if (currentUser?.id) {
      fetchGroups();
    }
  }, [currentUser, api]);

  return (
    <div className="rightBar">
      <div className="container">
        <div className="friends">
          <p>Following</p>
          {loadingFollowing ? (
            <div>Loading following...</div>
          ) : error ? (
            <div>{error}</div>
          ) : following.length === 0 ? (
            <div>Not following anyone yet</div>
          ) : (
            following.map((user) => (
              <Link 
                to={`/profile/${user.id}`} 
                style={{ textDecoration: "none", color: "inherit" }}
                key={user.id}
              >
                <div className="friend">
                  <img src={user.profilePicture} alt="" />
                  <span>{user.name} {user.lastname}</span>
                </div>
              </Link>
            ))
          )}
        </div>
        
        <div className="groups">
          <p>Your groups</p>
          {loadingGroups ? (
            <div>Loading groups...</div>
          ) : error ? (
            <div>{error}</div>
          ) : groups.length === 0 ? (
            <div>You don't belong to any group yet</div>
          ) : (
            groups.map((group) => (
              <Link 
                to={`/group/${group.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
                key={group.id}
              >
                <div className="group">
                  <img src={group.photoURL} alt="" />
                  <span>{group.summary}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default RightBar