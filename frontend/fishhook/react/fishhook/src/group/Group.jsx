import "./Group.scss"
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useAdmin } from "../hooks/useAdmin";
import Posts from "../components/posts/Posts.jsx";
import GroupUpdateForm from "../components/groupUpdateForm/GroupUpdateForm";
import { api } from "../context/AuthContext";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import ConfirmationModal from "../components/confirmationModal/ConfirmationModal";

const Group = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { isAdmin } = useAdmin();
  const [group, setGroup] = useState(null);
  const [owner, setOwner] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

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

  const handleDeleteGroup = async () => {
    try {
      await api.delete(`/group/${id}`);
      navigate('/group'); // Navigate back to groups list
    } catch (err) {
      console.error("Error deleting group:", err);
      setError(err.message || "Failed to delete group");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };
  
  const handleOpenUpdateForm = () => {
    setShowUpdateForm(true);
  };

  const handleCloseUpdateForm = () => {
    setShowUpdateForm(false);
  };

  const handleGroupUpdate = (updatedGroup) => {
    setGroup(updatedGroup);
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
              <button className="edit-group-btn" onClick={handleOpenUpdateForm}>
                <EditIcon /> Update Group
              </button>
            ) : isAdmin ? (
              <button 
                className="admin-delete-btn"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <DeleteOutlineIcon /> Delete Group
              </button>
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

      {showUpdateForm && (
        <GroupUpdateForm 
          group={group} 
          onClose={handleCloseUpdateForm} 
          onUpdate={handleGroupUpdate} 
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteGroup}
        title="Delete Group"
        message="As an admin, you are about to delete this group. This will permanently delete the group and all its posts. This action cannot be undone."
      />
    </div>
  )
}

export default Group