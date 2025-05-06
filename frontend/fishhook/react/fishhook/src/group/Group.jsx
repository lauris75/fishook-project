import "./Group.scss"
import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Posts from "../components/posts/Posts.jsx";
import { api } from "../context/AuthContext";

const Group = () => {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [group, setGroup] = useState(null);
  const [owner, setOwner] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const groupResponse = await api.get(`/group/${id}`);
        setGroup(groupResponse.data);

        const ownerResponse = await api.get(`/user/${groupResponse.data.ownerId}`);
        setOwner(ownerResponse.data);

        const membersResponse = await api.get(`/groupMember/${id}`);
        setIsMember(membersResponse.data.some(member => member.userId === currentUser.id));
        
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch group data");
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [id, currentUser.id]);

  const handleJoinLeave = async () => {
    try {
      if (isMember) {
        const membersResponse = await api.get(`/groupMember/${id}`);
        const membership = membersResponse.data.find(member => member.userId === currentUser.id);
        if (membership) {
          await api.delete(`/groupMember/${membership.id}`);
          setIsMember(false);
        }
      } else {
        await api.post('/groupMember', {
          groupId: parseInt(id),
          userId: currentUser.id
        });
        setIsMember(true);
      }
    } catch (err) {
      console.error("Error updating membership:", err);
    }
  };

  if (loading) return <div className="group">Loading group...</div>;
  if (error) return <div className="group">Error: {error}</div>;
  if (!group) return <div className="group">Group not found</div>;

  const isOwner = owner && owner.id === currentUser.id;

  return (
    <div className="group">
      <div className="images">
        <img src={group.photoURL || "https://images.unsplash.com/photo-1592929043000-fbea34bc8ad5?auto=format&fit=crop&w=1170&q=80"} 
             alt="" 
             className="cover" />
      </div>
      <div className="groupContainer">
        <div className="groupInfo">
          <div className="nameSection">
            <h1 className="name">{group.groupName}</h1>
            <div className="owner">
              <span>Group Owner: </span>
              {owner && (
                <div className="ownerInfo">
                  <img 
                    src={owner.profilePicture} 
                    alt={`${owner.name}'s profile`} 
                    className="ownerPic" 
                  />
                  <span>{owner.name} {owner.lastname}</span>
                </div>
              )}
            </div>
            <div className="description">
              {group.summary || "No description available for this group."}
            </div>
          </div>
          <div className="action">
            {isOwner ? (
              <button>Update Group</button>
            ) : (
              <button onClick={handleJoinLeave}>
                {isMember ? "Leave Group" : "Join Group"}
              </button>
            )}
          </div>
        </div>
      </div>
      
      <h2 className="postsTitle">Group Posts</h2>
      <div className="posts">
        <Posts groupId={parseInt(id)} />
      </div>
    </div>
  )
}

export default Group